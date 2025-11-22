import Swup from 'swup';
import SwupA11yPlugin from '@swup/a11y-plugin';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupDebugPlugin from '@swup/debug-plugin';
import SwupFadeTheme from '@swup/fade-theme';
import SwupFormsPlugin from '@swup/forms-plugin';
import SwupFragmentPlugin from '@swup/fragment-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupMorphPlugin from 'swup-morph-plugin';
import SwupOverlayTheme from '@swup/overlay-theme';
import SwupParallelPlugin from '@swup/parallel-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupProgressPlugin from '@swup/progress-plugin';
import SwupRouteNamePlugin from '@swup/route-name-plugin';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import SwupScrollPlugin from '@swup/scroll-plugin';
import SwupSlideTheme from '@swup/slide-theme';

/**
 * This would be great as a client script for dynamic importing.
 * However, it seems Astro will always bundle the whole script. Hence, we're creating a single
 * client package for each plugin and theme in the client/ subfolder for now.
 * It works, but it's not pretty :(
 */
export {
  Swup,
  SwupA11yPlugin,
  SwupBodyClassPlugin,
  SwupDebugPlugin,
  SwupFadeTheme,
  SwupFormsPlugin,
  SwupFragmentPlugin,
  SwupHeadPlugin,
  SwupMorphPlugin,
  SwupOverlayTheme,
  SwupParallelPlugin,
  SwupPreloadPlugin,
  SwupProgressPlugin,
  SwupRouteNamePlugin,
  SwupScriptsPlugin,
  SwupScrollPlugin,
  SwupSlideTheme,
}
