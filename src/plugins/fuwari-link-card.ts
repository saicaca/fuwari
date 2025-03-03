import type { AstroIntegration } from 'astro'
import remarkLinkCard from './remark-link-card.ts'
import type { UserOptions } from './remark-link-card.ts'

const fuwariLinkCard = (options: UserOptions = {}): AstroIntegration => {
  const integration: AstroIntegration = {
    hooks: {
      'astro:config:setup': ({ config, updateConfig }) => {
        options.base = options.base ?? config.base

        if (options.internalLink?.enabled) {
          options.internalLink.site = options.internalLink.site ?? config.site
        }

        // If the remark-sectionize plugin exists, insert the new plugin before it to avoid conflicts.
        const pluginName = 'plugin' // remark-sectionize
        const index = config.markdown.remarkPlugins.findIndex(element => {
          if (typeof element === 'function') return element.name === pluginName
          if (Array.isArray(element) && typeof element[0] === 'function')
            return element[0].name === pluginName
          return false
        })

        if (index !== -1) {
          config.markdown.remarkPlugins.splice(index, 0, [
            remarkLinkCard,
            options,
          ])
        } else {
          updateConfig({
            markdown: { remarkPlugins: [[remarkLinkCard, options]] },
          })
        }
      },
    },
    name: 'fuwari-link-card',
  }

  return integration
}

export default fuwariLinkCard
export type { UserOptions }