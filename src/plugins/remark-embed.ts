import deepmerge from '@fastify/deepmerge'
import { h } from 'hastscript'
import type { Link, Paragraph, PhrasingContent, Root, RootContent } from 'mdast'
import type { Plugin, Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Visitor } from 'unist-util-visit'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

interface Source {
  contentUrl: RegExp
  embedUrl?: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  queryParams?: Record<string, any>
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  iframeAttributes?: Record<string, any>
}

interface Options {
  sources: Source[]
}

type UserOptions = DeepPartial<Options>

const defaultOptions: Options = {
  sources: [],
}

const remarkEmbed: Plugin<[], Root> = (options?: UserOptions) => {
  const mergedOptions = deepmerge()(defaultOptions, options ?? {}) as Options

  const transformer: Transformer<Root> = async tree => {
    const visitor: Visitor<Paragraph> = (paragraphNode, index, parent) => {
      // if (
      //   index === undefined ||
      //   parent === undefined ||
      //   parent.type !== 'root' ||
      //   paragraphNode.data !== undefined
      // )
      //   return
      if (
        index === undefined ||
        parent === undefined
      )
        return

      const customNodes = createCustomNodes(paragraphNode, mergedOptions)

      if (customNodes.length) {
        parent.children.splice(index, 1, ...customNodes)
      }
    }

    visit(tree, 'paragraph', visitor)
  }

  return transformer
}

const findSource = (url: string, sources: Source[]): Source | null => {
  for (const source of sources) {
    if (source.contentUrl.test(url)) return source
  }

  return null
}

const convertToEmbedUrl = (url: string, source: Source): string => {
  const found = url.match(source.contentUrl)

  if (!found) return ''

  let embedUrl: string

  if (source.embedUrl) {
    embedUrl = source.embedUrl.replace(/\${(\d+)}/g, (_, p1) => {
      const index = Number.parseInt(p1, 10)
      return found[index] ?? ''
    })
  } else {
    embedUrl = found[0]
  }

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(source.queryParams ?? {})) {
    if (typeof value === 'string') {
      const replacedValue = value.replace(/\${(\d+)}/g, (_, p1) => {
        const index = Number.parseInt(p1, 10)
        return found[index] ?? ''
      })
      params.append(key, replacedValue)
    } else {
      params.append(key, String(value))
    }
  }

  const queryString = params.toString()

  return `${embedUrl}${queryString ? `?${queryString}` : ''}`
}

const isSoftBreak = (node: PhrasingContent): boolean => {
  return node.type === 'text' && (node.value === '\n' || node.value === '\r\n')
}

const extractValidLinkNodes = (
  paragraphNode: Paragraph,
  sources: Source[],
): Link[] => {
  const hasLinks = paragraphNode.children.every(
    child =>
      (child.type === 'link' && findSource(child.url, sources)) ||
      child.type === 'break' ||
      isSoftBreak(child),
  )

  return hasLinks
    ? paragraphNode.children.filter(child => child.type === 'link')
    : []
}

const createFigureFromLinks = (
  linkNodes: Link[],
  options: Options,
): RootContent => {
  const canNest = linkNodes.every(linkNode => linkNode.title)
  const children = linkNodes.map(linkNode => {
    const source = findSource(linkNode.url, options.sources)

    if (!source) throw new Error('Unexpected null value')

    const embedUrl = convertToEmbedUrl(linkNode.url, source)
    const iframe = h(
      'iframe',
      { src: embedUrl, ...(source.iframeAttributes ?? {}) },
      [],
    )

    if (canNest) {
      return h('figure', {}, [iframe, h('figcaption', {}, [linkNode.title])])
    }

    return iframe
  })

  return {
    type: 'text',
    value: '',
    data: {
      hName: 'figure',
      hProperties: {
        class: ['embed'].filter(Boolean).join(' '),
      },
      hChildren: [
        h('div', {}, ...children),
        ...(!canNest && linkNodes[0].title
          ? [h('figcaption', {}, [linkNodes[0].title])]
          : []),
      ],
    },
  }
}

const createCustomNodes = (
  paragraphNode: Paragraph,
  options: Options,
): RootContent[] => {
  const nodes: RootContent[] = []
  const extractedNodes = extractValidLinkNodes(paragraphNode, options.sources)

  if (!extractedNodes.length) return nodes

  nodes.push(createFigureFromLinks(extractedNodes, options))

  return nodes
}

export default remarkEmbed
