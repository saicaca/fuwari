import type { IconifyIcon } from '@iconify/types';
import type { IconifyIconCustomisations as RawIconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';
/**
 * Icon render mode
 *
 * 'style' = 'bg' or 'mask', depending on icon content
 * 'bg' = <span> with style using `background`
 * 'mask' = <span> with style using `mask`
 * 'svg' = <svg>
 */
export type IconifyRenderMode = 'style' | 'bg' | 'mask' | 'svg';
/**
 * Icon customisations
 */
export type IconifyIconCustomisations = RawIconifyIconCustomisations & {
    rotate?: string | number;
    inline?: boolean;
    ssr?: boolean;
};
export declare const defaultExtendedIconCustomisations: {
    inline: boolean;
    rotate: number;
    hFlip: boolean;
    vFlip: boolean;
    width: import("@iconify/utils/lib/customisations/defaults").IconifyIconSize;
    height: import("@iconify/utils/lib/customisations/defaults").IconifyIconSize;
};
/**
 * Icon properties
 */
export interface IconifyIconProps extends IconifyIconCustomisations {
    icon: IconifyIcon | string;
    mode?: IconifyRenderMode;
    color?: string;
    flip?: string;
}
/**
 * Properties for element that are mentioned in render.ts
 */
interface IconifyElementProps {
    id?: string;
    style?: string;
}
/**
 * Mix of icon properties and HTMLElement properties
 */
export type IconProps = IconifyElementProps & IconifyIconProps;
export {};
