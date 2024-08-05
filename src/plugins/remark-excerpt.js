import { toString } from 'mdast-util-to-string'

/* Use the post's first paragraph as the excerpt */
export function remarkExcerpt() {
  return (tree, { data }) => {
    let excerpt = ''
    for (let node of tree.children) {
      if (node.type !== 'paragraph') {
        continue
      }
      excerpt = toString(node)
      break
    }
    data.astro.frontmatter.excerpt = excerpt
  }
}
