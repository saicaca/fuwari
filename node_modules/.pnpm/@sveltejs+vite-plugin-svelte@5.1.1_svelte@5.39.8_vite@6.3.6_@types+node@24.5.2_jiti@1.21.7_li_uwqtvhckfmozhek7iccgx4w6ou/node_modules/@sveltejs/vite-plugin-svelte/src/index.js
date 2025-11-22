import fs from 'node:fs';
import process from 'node:process';
import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';
import { handleHotUpdate } from './handle-hot-update.js';
import { log, logCompilerWarnings } from './utils/log.js';
import { createCompileSvelte } from './utils/compile.js';
import { buildIdParser, buildModuleIdParser } from './utils/id.js';
import {
	buildExtraViteConfig,
	validateInlineOptions,
	resolveOptions,
	patchResolvedViteConfig,
	preResolveOptions,
	ensureConfigEnvironmentMainFields,
	ensureConfigEnvironmentConditions
} from './utils/options.js';
import { ensureWatchedFile, setupWatchers } from './utils/watch.js';
import { toRollupError } from './utils/error.js';
import { saveSvelteMetadata } from './utils/optimizer.js';
import { VitePluginSvelteCache } from './utils/vite-plugin-svelte-cache.js';
import { loadRaw } from './utils/load-raw.js';
import * as svelteCompiler from 'svelte/compiler';

/**
 * @param {Partial<import('./public.d.ts').Options>} [inlineOptions]
 * @returns {import('vite').Plugin[]}
 */
export function svelte(inlineOptions) {
	if (process.env.DEBUG != null) {
		log.setLevel('debug');
	}
	validateInlineOptions(inlineOptions);
	const cache = new VitePluginSvelteCache();
	// updated in configResolved hook
	/** @type {import('./types/id.d.ts').IdParser} */
	let requestParser;
	/** @type {import('./types/id.d.ts').ModuleIdParser} */
	let moduleRequestParser;
	/** @type {import('./types/options.d.ts').ResolvedOptions} */
	let options;
	/** @type {import('vite').ResolvedConfig} */
	let viteConfig;
	/** @type {import('./types/compile.d.ts').CompileSvelte} */
	let compileSvelte;
	/** @type {import('./types/plugin-api.d.ts').PluginAPI} */
	const api = {};
	/** @type {import('vite').Plugin[]} */
	const plugins = [
		{
			name: 'vite-plugin-svelte',
			// make sure our resolver runs before vite internal resolver to resolve svelte field correctly
			enforce: 'pre',
			api,
			async config(config, configEnv) {
				// setup logger
				if (process.env.DEBUG) {
					log.setLevel('debug');
				} else if (config.logLevel) {
					log.setLevel(config.logLevel);
				}
				// @ts-expect-error temporarily lend the options variable until fixed in configResolved
				options = await preResolveOptions(inlineOptions, config, configEnv);
				// extra vite config
				const extraViteConfig = await buildExtraViteConfig(options, config);
				log.debug('additional vite config', extraViteConfig, 'config');
				return extraViteConfig;
			},

			configEnvironment(name, config, opts) {
				ensureConfigEnvironmentMainFields(name, config, opts);
				// @ts-expect-error the function above should make `resolve.mainFields` non-nullable
				config.resolve.mainFields.unshift('svelte');

				ensureConfigEnvironmentConditions(name, config, opts);
				// @ts-expect-error the function above should make `resolve.conditions` non-nullable
				config.resolve.conditions.push('svelte');
			},

			async configResolved(config) {
				options = resolveOptions(options, config, cache);
				patchResolvedViteConfig(config, options);
				requestParser = buildIdParser(options);
				compileSvelte = createCompileSvelte();
				viteConfig = config;
				// TODO deep clone to avoid mutability from outside?
				api.options = options;
				log.debug('resolved options', options, 'config');
			},

			async buildStart() {
				if (!options.prebundleSvelteLibraries) return;
				const isSvelteMetadataChanged = await saveSvelteMetadata(viteConfig.cacheDir, options);
				if (isSvelteMetadataChanged) {
					// Force Vite to optimize again. Although we mutate the config here, it works because
					// Vite's optimizer runs after `buildStart()`.
					viteConfig.optimizeDeps.force = true;
				}
			},

			configureServer(server) {
				options.server = server;
				setupWatchers(options, cache, requestParser);
			},

			async load(id, opts) {
				const ssr = !!opts?.ssr;
				const svelteRequest = requestParser(id, !!ssr);
				if (svelteRequest) {
					const { filename, query, raw } = svelteRequest;
					if (raw) {
						const code = await loadRaw(svelteRequest, compileSvelte, options);
						// prevent vite from injecting sourcemaps in the results.
						return {
							code,
							map: {
								mappings: ''
							}
						};
					} else {
						if (query.svelte && query.type === 'style') {
							const cachedCss = cache.getCSS(svelteRequest);
							if (cachedCss) {
								const { hasGlobal, ...css } = cachedCss;
								if (hasGlobal === false) {
									// hasGlobal was added in svelte 5.26.0, so make sure it is boolean false
									css.meta ??= {};
									css.meta.vite ??= {};
									css.meta.vite.cssScopeTo = [svelteRequest.filename, 'default'];
								}
								return css;
							}
						}
						// prevent vite asset plugin from loading files as url that should be compiled in transform
						if (viteConfig.assetsInclude(filename)) {
							log.debug(`load returns raw content for ${filename}`, undefined, 'load');
							return fs.readFileSync(filename, 'utf-8');
						}
					}
				}
			},

			async resolveId(importee, importer, opts) {
				const ssr = !!opts?.ssr;
				const svelteRequest = requestParser(importee, ssr);
				if (svelteRequest?.query.svelte) {
					if (
						svelteRequest.query.type === 'style' &&
						!svelteRequest.raw &&
						!svelteRequest.query.inline
					) {
						// return cssId with root prefix so postcss pipeline of vite finds the directory correctly
						// see https://github.com/sveltejs/vite-plugin-svelte/issues/14
						log.debug(
							`resolveId resolved virtual css module ${svelteRequest.cssId}`,
							undefined,
							'resolve'
						);
						return svelteRequest.cssId;
					}
				}
			},

			async transform(code, id, opts) {
				const ssr = !!opts?.ssr;
				const svelteRequest = requestParser(id, ssr);
				if (!svelteRequest || svelteRequest.query.type === 'style' || svelteRequest.raw) {
					return;
				}
				let compileData;
				try {
					compileData = await compileSvelte(svelteRequest, code, options);
				} catch (e) {
					cache.setError(svelteRequest, e);
					throw toRollupError(e, options);
				}
				logCompilerWarnings(svelteRequest, compileData.compiled.warnings, options);
				cache.update(compileData);
				if (compileData.dependencies?.length) {
					if (options.server) {
						for (const dep of compileData.dependencies) {
							ensureWatchedFile(options.server.watcher, dep, options.root);
						}
					} else if (options.isBuild && viteConfig.build.watch) {
						for (const dep of compileData.dependencies) {
							this.addWatchFile(dep);
						}
					}
				}
				return {
					...compileData.compiled.js,
					meta: {
						vite: {
							lang: compileData.lang
						}
					}
				};
			},

			handleHotUpdate(ctx) {
				if (!options.compilerOptions.hmr || !options.emitCss) {
					return;
				}
				const svelteRequest = requestParser(ctx.file, false, ctx.timestamp);
				if (svelteRequest) {
					return handleHotUpdate(compileSvelte, ctx, svelteRequest, cache, options);
				}
			},
			async buildEnd() {
				await options.stats?.finishAll();
			}
		},
		{
			name: 'vite-plugin-svelte-module',
			enforce: 'post',
			async configResolved() {
				moduleRequestParser = buildModuleIdParser(options);
			},
			async transform(code, id, opts) {
				const ssr = !!opts?.ssr;
				const moduleRequest = moduleRequestParser(id, ssr);
				if (!moduleRequest) {
					return;
				}
				try {
					const compileResult = svelteCompiler.compileModule(code, {
						dev: !viteConfig.isProduction,
						generate: ssr ? 'server' : 'client',
						filename: moduleRequest.filename
					});
					logCompilerWarnings(moduleRequest, compileResult.warnings, options);
					return compileResult.js;
				} catch (e) {
					throw toRollupError(e, options);
				}
			}
		},
		svelteInspector()
	];
	return plugins;
}

export { vitePreprocess } from './preprocess.js';
export { loadSvelteConfig } from './utils/load-svelte-config.js';
