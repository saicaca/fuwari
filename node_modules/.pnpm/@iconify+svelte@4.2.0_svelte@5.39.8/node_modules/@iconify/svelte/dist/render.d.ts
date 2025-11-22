import type { IconifyIcon } from '@iconify/types';
import type { IconProps } from './props';
/**
 * Result
 */
interface RenderSVGResult {
    svg: true;
    attributes: Record<string, unknown>;
    body: string;
}
interface RenderSPANResult {
    svg: false;
    attributes: Record<string, unknown>;
}
export type RenderResult = RenderSVGResult | RenderSPANResult;
/**
 * Generate icon from properties
 */
export declare function render(icon: Required<IconifyIcon>, props: IconProps): RenderResult;
export {};
