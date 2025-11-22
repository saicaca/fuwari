import type { IconifyIcon } from '@iconify/types';
import type { IconifyJSON } from '@iconify/types';
import { IconifyTransformations } from '@iconify/types';

/**
 * Add collection to storage, allowing to call icons by name
 *
 * @param data Icon set
 * @param prefix Optional prefix to add to icon names, true (default) if prefix from icon set should be used.
 */
export declare function addCollection(data: IconifyJSON, prefix?: string | boolean): void;

/**
 * Add icon to storage, allowing to call it by name
 *
 * @param name
 * @param data
 */
export declare function addIcon(name: string, data: IconifyIcon): void;

/**
 * Generate icon
 */
export declare function generateIcon(props: IconProps): RenderResult | null;

/**
 * Properties for element that are mentioned in render.ts
 */
declare interface IconifyElementProps {
    id?: string;
    style?: string;
}

/**
 * Icon customisations
 */
declare type IconifyIconCustomisations = IconifyIconCustomisations_2 & {
    rotate?: string | number;
    inline?: boolean;
    ssr?: boolean;
};

/**
 * Icon customisations
 */
declare interface IconifyIconCustomisations_2 extends IconifyTransformations, IconifyIconSizeCustomisations {
}

/**
 * Icon properties
 */
declare interface IconifyIconProps extends IconifyIconCustomisations {
    icon: IconifyIcon | string;
    mode?: IconifyRenderMode;
    color?: string;
    flip?: string;
}

/**
 * Icon size
 */
declare type IconifyIconSize = null | string | number;

/**
 * Dimensions
 */
declare interface IconifyIconSizeCustomisations {
    width?: IconifyIconSize;
    height?: IconifyIconSize;
}

/**
 * Icon render mode
 *
 * 'style' = 'bg' or 'mask', depending on icon content
 * 'bg' = <span> with style using `background`
 * 'mask' = <span> with style using `mask`
 * 'svg' = <svg>
 */
declare type IconifyRenderMode = 'style' | 'bg' | 'mask' | 'svg';

/**
 * Mix of icon properties and HTMLElement properties
 */
declare type IconProps = IconifyElementProps & IconifyIconProps;

declare type RenderResult = RenderSVGResult | RenderSPANResult;

declare interface RenderSPANResult {
    svg: false;
    attributes: Record<string, unknown>;
}

/**
 * Result
 */
declare interface RenderSVGResult {
    svg: true;
    attributes: Record<string, unknown>;
    body: string;
}

export { }
