import type { AstroIntegration } from '@swup/astro'

declare global {
  interface Window {
    // type from '@swup/astro' is incorrect
    swup: AstroIntegration
  }
}
