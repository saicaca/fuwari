import deepmerge from '@fastify/deepmerge'
import { type Child, type Properties, h } from 'hastscript'
import type {
  Image,
  Link,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
} from 'mdast'
import type { Plugin, Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Visitor } from 'unist-util-visit'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

interface LinkAttributes {
  target: string
  rel: string
}

interface Options {
  prose: boolean
  lazyLoad: boolean
  linkAttributes: LinkAttributes
}

type UserOptions = DeepPartial<Options>

const defaultOptions: Options = {
  prose: true,
  lazyLoad: false,
  linkAttributes: { target: '', rel: '' },
}

const remarkImageCaption: Plugin<[], Root> = (options?: UserOptions) => {
  const mergedOptions = deepmerge()(defaultOptions, options ?? {}) as Options

  const transformer: Transformer<Root> = async tree => {
    const visitor: Visitor<Paragraph> = (paragraphNode, index, parent) => {
      if (
        index === undefined ||
        parent === undefined ||
        parent.type !== 'root' ||
        paragraphNode.data !== undefined
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

const isRelativePath = (path: string): boolean => {
  return !/^(?:[a-zA-Z]+:)?\//.test(path)
}

const isSoftBreak = (node: PhrasingContent): boolean => {
  return node.type === 'text' && (node.value === '\n' || node.value === '\r\n')
}

const isRelevantNode = (node: PhrasingContent): boolean => {
  return (
    (node.type === 'image' && !isRelativePath(node.url)) ||
    node.type === 'break' ||
    isSoftBreak(node)
  )
}

const extractValidImageNodes = (paragraphNode: Paragraph): Image[] => {
  const hasImages = paragraphNode.children.every(child => isRelevantNode(child))

  return hasImages
    ? paragraphNode.children.filter(child => child.type === 'image')
    : []
}

const extractValidImageLinkNodes = (paragraphNode: Paragraph): Link[] => {
  const hasImageLinks = paragraphNode.children.every(
    child =>
      child.type === 'link' &&
      child.children.length &&
      child.children.every(subChild => isRelevantNode(subChild)),
  )

  return hasImageLinks
    ? ((paragraphNode.children as Link[]).map(child => ({
        ...child,
        children: child.children.filter(subChild => subChild.type === 'image'),
      })) as Link[])
    : []
}

const createImageProperties = (
  imageNode: Image,
  lazyLoad: boolean,
): Properties => {
  return {
    alt: imageNode.alt,
    src: imageNode.url,
    ...(lazyLoad && { loading: 'lazy' }),
  }
}

const createFigureFromImages = (
  imageNodes: Image[],
  options: Options,
): RootContent => {
  const canNest = imageNodes.every(imageNode => imageNode.title)

  let children: Child[]

  if (canNest) {
    children = imageNodes.map(imageNode =>
      h('figure', {}, [
        h('img', createImageProperties(imageNode, options.lazyLoad), []),
        h('figcaption', {}, [imageNode.title]),
      ]),
    )
  } else {
    children = imageNodes.map(imageNode =>
      h('img', createImageProperties(imageNode, options.lazyLoad), []),
    )
  }

  return {
    type: 'text',
    value: '',
    data: {
      hName: 'figure',
      hProperties: {
        class: ['image-caption', !options.prose && 'not-prose']
          .filter(Boolean)
          .join(' '),
      },
      hChildren: [
        h('div', {}, ...children),
        ...(!canNest && imageNodes[0].title
          ? [h('figcaption', {}, [imageNodes[0].title])]
          : []),
      ],
    },
  }
}

const isAbsoluteUrl = (url: string): boolean => {
  return /^[a-z][a-z\d+\-.]*:/i.test(url)
}

const createFigureFromLink = (
  linkNode: Link,
  options: Options,
): RootContent => {
  const imageNodes = linkNode.children as Image[]
  const canNest = imageNodes.some(imageNode => imageNode.title)
  const target = options.linkAttributes.target
  const rel = options.linkAttributes.rel

  let children: Child[]

  if (canNest) {
    children = imageNodes.map(imageNode =>
      h('figure', {}, [
        h('img', createImageProperties(imageNode, options.lazyLoad), []),
        h('figcaption', {}, [imageNode.title]),
      ]),
    )
  } else {
    children = imageNodes.map(imageNode =>
      h('img', createImageProperties(imageNode, options.lazyLoad), []),
    )
  }

  return {
    type: 'text',
    value: '',
    data: {
      hName: 'figure',
      hProperties: {
        class: ['image-caption', !options.prose && 'not-prose']
          .filter(Boolean)
          .join(' '),
      },
      hChildren: [
        h(
          'a',
          {
            href: linkNode.url,
            ...(isAbsoluteUrl(linkNode.url) && {
              ...(target && { target }),
              ...(rel && { rel }),
            }),
          },
          ...children,
        ),
        ...(linkNode.title ? [h('figcaption', {}, [linkNode.title])] : []),
      ],
    },
  }
}

const createCustomNodes = (
  paragraphNode: Paragraph,
  options: Options,
): RootContent[] => {
  const nodes: RootContent[] = []

  let extractedNodes: Image[] | Link[] = extractValidImageNodes(paragraphNode)

  if (extractedNodes.length) {
    const newNode = createFigureFromImages(extractedNodes, options)
    nodes.push(newNode)
    return nodes
  }

  extractedNodes = extractValidImageLinkNodes(paragraphNode)

  if (extractedNodes.length) {
    for (const extractedNode of extractedNodes) {
      const newNode = createFigureFromLink(extractedNode, options)
      nodes.push(newNode)
    }
    return nodes
  }

  return []
}

export default remarkImageCaption
export type { UserOptions }