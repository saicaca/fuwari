declare module 'virtual:astro-expressive-code/config' {
	import type { AstroExpressiveCodeOptions, PartialAstroConfig } from 'astro-expressive-code'
	export const astroConfig: PartialAstroConfig
	export const ecConfigFileOptions: AstroExpressiveCodeOptions
	export const ecIntegrationOptions: AstroExpressiveCodeOptions
}

declare module 'virtual:astro-expressive-code/preprocess-config' {
	import type { ConfigPreprocessorFn } from 'astro-expressive-code'
	const preprocessEcConfig: ConfigPreprocessorFn
	export default preprocessEcConfig
}

declare module 'virtual:astro-expressive-code/api' {
	export const createAstroRenderer: typeof import('astro-expressive-code').createAstroRenderer
	export const mergeEcConfigOptions: typeof import('astro-expressive-code').mergeEcConfigOptions
}
