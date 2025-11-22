import type { RedirectConfig } from '../../types/public/index.js';
import type { RenderContext } from '../render-context.js';
export declare function redirectIsExternal(redirect: RedirectConfig): boolean;
export declare function renderRedirect(renderContext: RenderContext): Promise<Response>;
