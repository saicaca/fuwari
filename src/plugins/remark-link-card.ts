import { createHash } from 'node:crypto'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import deepmerge from '@fastify/deepmerge'
import { h } from 'hastscript'
import type { Link, Paragraph, Root, Text } from 'mdast'
import ogs from 'open-graph-scraper'
import type { ErrorResult, OgObject } from 'open-graph-scraper/types'
import punycode from 'punycode/'
import type { Plugin, Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Visitor } from 'unist-util-visit'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

type ObtainKeys<T, V> = keyof {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [K in keyof T as T[K] extends V ? K : never]: any
}

interface LinkAttributes {
  target: string
  rel: string
}

interface RewriteStep {
  key: string
  pattern: RegExp
  replacement: string
}

interface RewriteRule {
  url: RegExp
  rewriteSteps: RewriteStep[]
}

interface InternalLink {
  enabled: boolean
  site: string
}

interface Cache {
  enabled: boolean
  outDir: string
  cacheDir: string
  maxFileSize: number
  maxCacheSize: number
  userAgent: string
}

interface Options {
  devMode: boolean
  linkAttributes: LinkAttributes
  rewriteRules: RewriteRule[]
  base: string
  defaultThumbnail: string
  internalLink: InternalLink
  cache: Cache
}

type UserOptions = DeepPartial<Options>

interface BareLink {
  url: URL
  isInternal: boolean
}

interface Data {
  url: string
  domainName: string
  title: string
  description: string
  date: string
  faviconSrc: string
  thumbnailSrc: string
  thumbnailAlt: string
  hasThumbnail: boolean
  isInternalLink: boolean
}

const defaultOptions: Options = {
  devMode: import.meta.env.DEV,
  linkAttributes: { target: '', rel: '' },
  rewriteRules: [],
  base: '/',
  defaultThumbnail: '',
  internalLink: { enabled: false, site: '' },
  cache: {
    enabled: false,
    outDir: './dist/',
    cacheDir: './link-card/',
    maxFileSize: 0,
    maxCacheSize: 0,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  },
}

const mimeExtensions: Record<string, string> = {
  'image/apng': '.apng',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  'image/x-icon': '.ico',
  'image/tiff': '.tif',
}

const remarkLinkCard: Plugin<[], Root> = (options?: UserOptions) => {
  const mergedOptions = deepmerge()(defaultOptions, options ?? {}) as Options

  const transformer: Transformer<Root> = async tree => {
    const tasks: Array<() => Promise<void>> = []

    const visitor: Visitor<Paragraph> = (paragraphNode, index, parent) => {
      if (
        index === undefined ||
        parent === undefined ||
        parent.type !== 'root' ||
        paragraphNode.children.length !== 1 ||
        paragraphNode.data !== undefined
      )
        return

      visit(paragraphNode, 'link', linkNode => {
        const bareLink = getBareLink(linkNode, mergedOptions)
        if (!bareLink) return

        const url = linkNode.url

        tasks.push(async () => {
          const data = await getData(bareLink, mergedOptions)
          if (!data) return

          for (const rewriteRule of mergedOptions.rewriteRules) {
            if (!rewriteRule.url.test(url)) continue

            for (const rewriteStep of rewriteRule.rewriteSteps) {
              if (!Object.hasOwn(data, rewriteStep.key)) continue

              const key = rewriteStep.key as ObtainKeys<Data, string>
              data[key] = data[key].replace(
                rewriteStep.pattern,
                rewriteStep.replacement,
              )
            }
          }

          const newNode = generateNode(data, mergedOptions)
          parent.children.splice(index, 1, newNode)
        })
      })
    }

    visit(tree, 'paragraph', visitor)

    try {
      await Promise.all(tasks.map(t => t()))
    } catch (error) {
      console.error(`[remark-link-card] Error: ${error}`)
      throw error
    }
  }

  return transformer
}

const isAbsoluteUrl = (url: string): boolean => {
  return /^[a-z][a-z\d+\-.]*:/i.test(url)
}

const isValidUrl = (url: string): boolean => {
  return /^https?:\/\/(?:[-.\w]+)(?:\/[^\s]*)?$/.test(url)
}

const getBareLink = (linkNode: Link, options: Options): BareLink | null => {
  if (
    linkNode.children.length !== 1 ||
    linkNode.children[0].type !== 'text' ||
    linkNode.children[0].value !== linkNode.url ||
    /\s/.test(linkNode.url) // When the URL contains multiple URLs
  )
    return null

  const url = linkNode.url
  const isInternal = !isAbsoluteUrl(url)
  const base =
    options.internalLink.enabled && isInternal
      ? options.internalLink.site
      : undefined

  let parsedUrl: URL

  try {
    parsedUrl = new URL(url, base)
  } catch {
    return null
  }

  if (!isValidUrl(parsedUrl.href)) return null

  return { url: parsedUrl, isInternal: isInternal }
}

const fetchMetadata = async (
  url: string,
  options: Options,
): Promise<OgObject | null> => {
  try {
    const data = await ogs({
      url: url,
      fetchOptions: { headers: { 'user-agent': options.cache.userAgent } },
      timeout: 10000,
    })
    if (data.error) return null

    return data.result
  } catch (error) {
    const errorResult = error as ErrorResult
    console.warn(
      `[remark-link-card] Warning: Failed to fetch Open Graph data for ${errorResult.result.requestUrl} due to ${errorResult.result.error}.`,
    )

    return null
  }
}

const getDirSize = async (dirPath: string): Promise<number> => {
  const files = await fs.readdir(dirPath, { withFileTypes: true })
  const promises = files.map(async file => {
    const filePath = path.join(dirPath, file.name)
    if (file.isDirectory()) return await getDirSize(filePath)

    const { size } = await fs.stat(filePath)
    return size
  })

  const sizes = await Promise.all(promises)
  return sizes.reduce((accumulator, size) => accumulator + size, 0)
}

const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

const existsCache = async (
  cachePath: string,
  cacheName: string,
): Promise<string | undefined> => {
  const cachedFileNames = await fs.readdir(cachePath)
  return cachedFileNames.find(cachedFileName =>
    cachedFileName.startsWith(cacheName),
  )
}

const IsCacheable = async (
  fileSize: number,
  cachePath: string,
  maxFileSize: number,
  maxCacheSize: number,
): Promise<boolean> => {
  const exceedsMaxFileSize = maxFileSize > 0 && fileSize > maxFileSize
  const exceedsMaxCacheSize =
    maxCacheSize > 0 && (await getDirSize(cachePath)) + fileSize > maxCacheSize

  return !(exceedsMaxFileSize || exceedsMaxCacheSize)
}

const downloadImage = async (
  url: string,
  cachePath: string,
  options: Options,
): Promise<string | null> => {
  try {
    await ensureDirectoryExists(cachePath)

    const stem = createHash('sha256').update(decodeURI(url)).digest('hex')
    const cachedFileName = await existsCache(cachePath, stem)
    if (cachedFileName) return cachedFileName

    const response = await fetch(url, {
      headers: { 'User-Agent': options.cache.userAgent },
      signal: AbortSignal.timeout(10000),
    })
    const contentType = response.headers.get('Content-Type') || ''
    const extension = mimeExtensions[contentType] ?? ''

    if (extension === '') return null

    const arrayBuffer = await response.arrayBuffer()

    if (
      !IsCacheable(
        arrayBuffer.byteLength,
        cachePath,
        options.cache.maxFileSize,
        options.cache.maxCacheSize,
      )
    )
      return null

    const fileName = `${stem}${extension}`
    const filePath = path.join(cachePath, fileName)
    const buffer = Buffer.from(arrayBuffer)

    await fs.writeFile(filePath, buffer)

    return fileName
  } catch (error) {
    console.error(`[remark-link-card] Error: ${error}`)
    return null
  }
}

const getImageUrl = async (url: string, options: Options): Promise<string> => {
  let imageUrl = url

  if (!options.cache.enabled) return imageUrl

  const cachePath = path.join(options.cache.outDir, options.cache.cacheDir)
  const fileName = await downloadImage(imageUrl, cachePath, options)

  if (fileName) {
    const regex = /^(public|\.\/public)\/?$/
    const cachaDir =
      options.devMode && !regex.test(options.cache.outDir)
        ? cachePath
        : options.cache.cacheDir

    imageUrl = path.join(options.base, cachaDir, fileName)
    imageUrl = imageUrl.replaceAll(path.sep, path.posix.sep)
  }

  return imageUrl
}

const getFaviconUrl = async (
  url: string,
  options: Options,
): Promise<string> => {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${url}`

  return await getImageUrl(faviconUrl, options)
}

const getData = async (
  bareLink: BareLink,
  options: Options,
): Promise<Data | null> => {
  const metadata = await fetchMetadata(bareLink.url.href, options)
  if (!metadata) return null

  const url = bareLink.isInternal
    ? bareLink.url.href.replace(bareLink.url.origin, '')
    : bareLink.url.href

  const result: Data = {
    url: url,
    domainName: bareLink.url.hostname,
    title: '',
    description: '',
    date: '',
    faviconSrc: '',
    thumbnailSrc: '',
    thumbnailAlt: 'thumbnail',
    hasThumbnail: false,
    isInternalLink: bareLink.isInternal,
  }

  result.title = metadata.ogTitle ?? ''
  result.description = metadata.ogDescription ?? ''

  const date = metadata.ogDate ? new Date(metadata.ogDate) : null
  if (date && !Number.isNaN(date)) {
    result.date = `${date.toISOString().split('.')[0]}Z`
  }

  result.faviconSrc = await getFaviconUrl(bareLink.url.hostname, options)

  if (metadata.ogImage?.[0]?.url) {
    result.thumbnailSrc = await getImageUrl(metadata.ogImage[0].url, options)
    result.hasThumbnail = true
  } else if (options.defaultThumbnail) {
    result.thumbnailSrc = path.join(options.base, options.defaultThumbnail)
    result.thumbnailSrc = result.thumbnailSrc.replaceAll(
      path.sep,
      path.posix.sep,
    )
  }

  if (metadata.ogImage?.[0]?.alt) {
    result.thumbnailAlt = metadata.ogImage[0].alt
  }

  return result
}

const generateNode = (data: Data, options: Options): Text => {
  const target = options.linkAttributes.target
  const rel = options.linkAttributes.rel

  return {
    type: 'text',
    value: '',
    data: {
      hName: 'div',
      hProperties: { class: 'link-card__container' },
      hChildren: [
        h(
          'a',
          {
            class: 'link-card',
            href: data.url,
            ...(!data.isInternalLink && {
              ...(target && { target }),
              ...(rel && { rel }),
            }),
          },
          [
            h('div', { class: 'link-card__info' }, [
              h('div', { class: 'link-card__title' }, [data.title]),
              h('div', { class: 'link-card__description' }, [data.description]),
              h('div', { class: 'link-card__metadata' }, [
                h('div', { class: 'link-card__domain' }, [
                  h(
                    'img',
                    {
                      class: 'link-card__favicon',
                      src: data.faviconSrc,
                      alt: 'favicon',
                    },
                    [],
                  ),
                  h('span', { class: 'link-card__domain-name' }, [
                    punycode.toUnicode(data.domainName),
                  ]),
                ]),
                ...(data.date
                  ? [h('span', { class: 'link-card__date' }, [data.date])]
                  : []),
              ]),
            ]),
            ...(data.thumbnailSrc
              ? [
                  h(
                    'div',
                    {
                      class:
                        `link-card__thumbnail ${data.hasThumbnail ? '' : 'link-card__thumbnail--default'}`.trim(),
                    },
                    [
                      h(
                        'img',
                        {
                          class: 'link-card__image',
                          src: data.thumbnailSrc,
                          alt: data.thumbnailAlt,
                        },
                        [],
                      ),
                    ],
                  ),
                ]
              : []),
          ],
        ),
      ],
    },
  }
}

export default remarkLinkCard
export type { UserOptions }
