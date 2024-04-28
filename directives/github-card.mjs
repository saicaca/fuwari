/// <reference types="mdast" />
import { visit } from 'unist-util-visit'

function githubCardDirective(tree) {
  /**
   * @param {import('mdast').Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return (tree) => {
    visit(tree, function (node) {
      if (node.type === 'leafDirective') {
        if (node.name !== 'github') return

        const data = node.data || (node.data = {})
        const attributes = node.attributes || {}

        data.hName = 'iframe'
        data.hProperties = {
          src: 'https://www.youtube.com/embed/',
          width: 200,
          height: 200,
          frameBorder: 0,
          allow: 'picture-in-picture',
          allowFullScreen: true
        }
      }
    })
  }
}

export default githubCardDirective