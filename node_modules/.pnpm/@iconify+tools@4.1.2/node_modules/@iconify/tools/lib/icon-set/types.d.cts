import { ExtendedIconifyIcon, ExtendedIconifyAlias, IconifyOptional, IconifyIcon } from '@iconify/types';

/**
 * Category item
 */
interface IconCategory {
    title: string;
    count: number;
}
/**
 * Get common properties: IconifyOptional + APIIconAttributes
 */
type CommonProps<A, B> = {
    [K in keyof A & keyof B]?: A[K] extends B[K] ? A[K] : never;
};
type CommonIconProps = CommonProps<ExtendedIconifyIcon, ExtendedIconifyAlias>;
/**
 * Exclude IconifyOptional from CommonIconProps
 */
type ExtraIconProps = Omit<CommonIconProps, keyof IconifyOptional>;
/**
 * Partials
 */
interface IconWithChars {
    chars: Set<string>;
}
interface IconWithPropsData extends IconWithChars {
    props: CommonIconProps;
}
interface IconWithCategories {
    categories: Set<IconCategory>;
}
interface IconParentData {
    parent: string;
}
/**
 * Icon types
 */
interface IconSetIcon extends IconWithPropsData, IconWithCategories {
    type: 'icon';
    body: string;
}
interface IconSetIconAlias extends IconWithChars, IconParentData {
    type: 'alias';
}
interface IconSetIconVariation extends IconWithPropsData, IconParentData {
    type: 'variation';
}
/**
 * All icon types
 */
type IconSetIconEntry = IconSetIcon | IconSetIconAlias | IconSetIconVariation;
type IconSetIconType = IconSetIconEntry['type'];
/**
 * Full icon with extra stuff
 */
interface ResolvedIconifyIcon extends IconifyIcon, ExtraIconProps {
}
/**
 * Result for checking theme: list of names for each theme
 */
interface CheckThemeResult {
    valid: Record<string, string[]>;
    invalid: string[];
}
/**
 * Callback for forEach functions
 *
 * Return false to stop loop
 */
type IconSetForEachCallbackResult = void | false;
type IconSetAsyncForEachCallback = (name: string, type: IconSetIconEntry['type']) => Promise<IconSetForEachCallbackResult> | IconSetForEachCallbackResult;
type IconSetSyncForEachCallback = (name: string, type: IconSetIconEntry['type']) => IconSetForEachCallbackResult;

export type { CheckThemeResult, CommonIconProps, ExtraIconProps, IconCategory, IconParentData, IconSetAsyncForEachCallback, IconSetIcon, IconSetIconAlias, IconSetIconEntry, IconSetIconType, IconSetIconVariation, IconSetSyncForEachCallback, IconWithCategories, IconWithChars, IconWithPropsData, ResolvedIconifyIcon };
