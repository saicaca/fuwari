import type { SSRResult } from '../../../types/public/internal.js';
import { HTMLString } from '../escape.js';
import { renderTemplate } from './astro/render-template.js';
import { type RenderInstance } from './common.js';
import type { RenderInstruction } from './instruction.js';
type RenderTemplateResult = ReturnType<typeof renderTemplate>;
export type ComponentSlots = Record<string, ComponentSlotValue>;
export type ComponentSlotValue = (result: SSRResult) => RenderTemplateResult | Promise<RenderTemplateResult>;
declare const slotString: unique symbol;
export declare class SlotString extends HTMLString {
    instructions: null | RenderInstruction[];
    [slotString]: boolean;
    constructor(content: string, instructions: null | RenderInstruction[]);
}
export declare function isSlotString(str: string): str is any;
export declare function renderSlot(result: SSRResult, slotted: ComponentSlotValue | RenderTemplateResult, fallback?: ComponentSlotValue | RenderTemplateResult): RenderInstance;
export declare function renderSlotToString(result: SSRResult, slotted: ComponentSlotValue | RenderTemplateResult, fallback?: ComponentSlotValue | RenderTemplateResult): Promise<string>;
interface RenderSlotsResult {
    slotInstructions: null | RenderInstruction[];
    children: Record<string, string>;
}
export declare function renderSlots(result: SSRResult, slots?: ComponentSlots): Promise<RenderSlotsResult>;
export declare function createSlotValueFromString(content: string): ComponentSlotValue;
export {};
