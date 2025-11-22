export { Provide } from './lib/plugins/semantic';
import { create as createSemanticServicePlugin } from './lib/plugins/semantic';
import { create as createSyntacticServicePlugin } from './lib/plugins/syntactic';
export declare function create(ts: typeof import('typescript'), options?: Parameters<typeof createSemanticServicePlugin>[1] & Parameters<typeof createSyntacticServicePlugin>[1]): import("@volar/language-service").LanguageServicePlugin<any>[];
//# sourceMappingURL=index.d.ts.map