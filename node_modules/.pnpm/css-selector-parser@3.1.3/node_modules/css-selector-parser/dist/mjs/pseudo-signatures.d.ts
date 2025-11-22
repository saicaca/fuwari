import { PseudoClassType } from './syntax-definitions.js';
export type PseudoSignature = {
    optional: boolean;
} & ({
    type: 'Formula';
    ofSelector?: boolean;
} | {
    type: 'String';
} | {
    type: 'Selector';
} | {
    type: 'NoArgument';
});
export type PseudoSignatures = Record<string, PseudoSignature>;
export declare const emptyPseudoSignatures: PseudoSignatures;
export declare const defaultPseudoSignature: PseudoSignature;
type PseudoArgumentType = PseudoClassType;
export type CategoriesIndex<T1 extends string, T2 extends string> = {
    [K in T1]?: T2[];
};
export declare function inverseCategories<T1 extends string, T2 extends string>(obj: CategoriesIndex<T1, T2>): CategoriesIndex<T2, T1>;
export declare function calculatePseudoSignatures<T extends PseudoArgumentType>(definitions: {
    [K in T]?: string[];
}): PseudoSignatures;
export {};
