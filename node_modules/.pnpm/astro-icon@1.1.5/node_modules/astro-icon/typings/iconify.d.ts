import type { runSVGO } from "@iconify/tools";

export type SVGOOptions = Omit<Parameters<typeof runSVGO>[1], "keepShapes">;

export type { IconifyJSON } from "@iconify/types";
export type { SVG } from "@iconify/tools";
export type { Color } from "@iconify/utils/lib/colors/types";
export type { AutoInstall } from "@iconify/utils/lib/loader/types";
