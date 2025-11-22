import { z } from 'zod';
declare const StringSchema: z.ZodObject<{
    type: z.ZodLiteral<"string">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodNumber>;
    min: z.ZodOptional<z.ZodNumber>;
    length: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodBoolean>;
    includes: z.ZodOptional<z.ZodString>;
    startsWith: z.ZodOptional<z.ZodString>;
    endsWith: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "string";
    length?: number | undefined;
    includes?: string | undefined;
    endsWith?: string | undefined;
    startsWith?: string | undefined;
    optional?: boolean | undefined;
    url?: boolean | undefined;
    default?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
}, {
    type: "string";
    length?: number | undefined;
    includes?: string | undefined;
    endsWith?: string | undefined;
    startsWith?: string | undefined;
    optional?: boolean | undefined;
    url?: boolean | undefined;
    default?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
}>;
export type StringSchema = z.infer<typeof StringSchema>;
declare const NumberSchema: z.ZodObject<{
    type: z.ZodLiteral<"number">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodNumber>;
    gt: z.ZodOptional<z.ZodNumber>;
    min: z.ZodOptional<z.ZodNumber>;
    lt: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    int: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "number";
    optional?: boolean | undefined;
    default?: number | undefined;
    max?: number | undefined;
    min?: number | undefined;
    gt?: number | undefined;
    lt?: number | undefined;
    int?: boolean | undefined;
}, {
    type: "number";
    optional?: boolean | undefined;
    default?: number | undefined;
    max?: number | undefined;
    min?: number | undefined;
    gt?: number | undefined;
    lt?: number | undefined;
    int?: boolean | undefined;
}>;
export type NumberSchema = z.infer<typeof NumberSchema>;
declare const BooleanSchema: z.ZodObject<{
    type: z.ZodLiteral<"boolean">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "boolean";
    optional?: boolean | undefined;
    default?: boolean | undefined;
}, {
    type: "boolean";
    optional?: boolean | undefined;
    default?: boolean | undefined;
}>;
declare const EnumSchema: z.ZodObject<{
    type: z.ZodLiteral<"enum">;
    values: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}>;
export type EnumSchema = z.infer<typeof EnumSchema>;
declare const EnvFieldType: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"string">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodNumber>;
    min: z.ZodOptional<z.ZodNumber>;
    length: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodBoolean>;
    includes: z.ZodOptional<z.ZodString>;
    startsWith: z.ZodOptional<z.ZodString>;
    endsWith: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "string";
    length?: number | undefined;
    includes?: string | undefined;
    endsWith?: string | undefined;
    startsWith?: string | undefined;
    optional?: boolean | undefined;
    url?: boolean | undefined;
    default?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
}, {
    type: "string";
    length?: number | undefined;
    includes?: string | undefined;
    endsWith?: string | undefined;
    startsWith?: string | undefined;
    optional?: boolean | undefined;
    url?: boolean | undefined;
    default?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"number">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodNumber>;
    gt: z.ZodOptional<z.ZodNumber>;
    min: z.ZodOptional<z.ZodNumber>;
    lt: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    int: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "number";
    optional?: boolean | undefined;
    default?: number | undefined;
    max?: number | undefined;
    min?: number | undefined;
    gt?: number | undefined;
    lt?: number | undefined;
    int?: boolean | undefined;
}, {
    type: "number";
    optional?: boolean | undefined;
    default?: number | undefined;
    max?: number | undefined;
    min?: number | undefined;
    gt?: number | undefined;
    lt?: number | undefined;
    int?: boolean | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"boolean">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "boolean";
    optional?: boolean | undefined;
    default?: boolean | undefined;
}, {
    type: "boolean";
    optional?: boolean | undefined;
    default?: boolean | undefined;
}>, z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"enum">;
    values: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}>, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}>]>;
export type EnvFieldType = z.infer<typeof EnvFieldType>;
declare const EnvFieldMetadata: z.ZodEffects<z.ZodType<{
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}, z.ZodTypeDef, {
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}>, {
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}, {
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}>;
export declare const EnvSchema: z.ZodRecord<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, z.ZodIntersection<z.ZodEffects<z.ZodType<{
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}, z.ZodTypeDef, {
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}>, {
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}, {
    context: "client";
    access: "public";
} | {
    context: "server";
    access: "public";
} | {
    context: "server";
    access: "secret";
}>, z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"string">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodNumber>;
    min: z.ZodOptional<z.ZodNumber>;
    length: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodBoolean>;
    includes: z.ZodOptional<z.ZodString>;
    startsWith: z.ZodOptional<z.ZodString>;
    endsWith: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "string";
    length?: number | undefined;
    includes?: string | undefined;
    endsWith?: string | undefined;
    startsWith?: string | undefined;
    optional?: boolean | undefined;
    url?: boolean | undefined;
    default?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
}, {
    type: "string";
    length?: number | undefined;
    includes?: string | undefined;
    endsWith?: string | undefined;
    startsWith?: string | undefined;
    optional?: boolean | undefined;
    url?: boolean | undefined;
    default?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"number">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodNumber>;
    gt: z.ZodOptional<z.ZodNumber>;
    min: z.ZodOptional<z.ZodNumber>;
    lt: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    int: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "number";
    optional?: boolean | undefined;
    default?: number | undefined;
    max?: number | undefined;
    min?: number | undefined;
    gt?: number | undefined;
    lt?: number | undefined;
    int?: boolean | undefined;
}, {
    type: "number";
    optional?: boolean | undefined;
    default?: number | undefined;
    max?: number | undefined;
    min?: number | undefined;
    gt?: number | undefined;
    lt?: number | undefined;
    int?: boolean | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"boolean">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "boolean";
    optional?: boolean | undefined;
    default?: boolean | undefined;
}, {
    type: "boolean";
    optional?: boolean | undefined;
    default?: boolean | undefined;
}>, z.ZodEffects<z.ZodObject<{
    type: z.ZodLiteral<"enum">;
    values: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    optional: z.ZodOptional<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}>, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}, {
    values: string[];
    type: "enum";
    optional?: boolean | undefined;
    default?: string | undefined;
}>]>>>;
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
export type EnvSchema = z.infer<typeof EnvSchema>;
type _Field<T extends z.ZodType> = Prettify<z.infer<typeof EnvFieldMetadata & T>>;
type _FieldInput<T extends z.ZodType, TKey extends string = 'type'> = Prettify<z.infer<typeof EnvFieldMetadata> & Omit<z.infer<T>, TKey>>;
export type StringField = _Field<typeof StringSchema>;
export type StringFieldInput = _FieldInput<typeof StringSchema>;
export type NumberField = _Field<typeof NumberSchema>;
export type NumberFieldInput = _FieldInput<typeof NumberSchema>;
export type BooleanField = _Field<typeof BooleanSchema>;
export type BooleanFieldInput = _FieldInput<typeof BooleanSchema>;
export type EnumField = _Field<typeof EnumSchema>;
export type EnumFieldInput<T extends string> = Prettify<_FieldInput<typeof EnumSchema, 'type' | 'values' | 'default'> & {
    values: Array<T>;
    default?: NoInfer<T> | undefined;
}>;
export {};
