import { ASTNode } from '../jsonASTTypes';
export declare class FlowStyleRewriter {
    private readonly indentation;
    constructor(indentation: string);
    write(node: ASTNode): string | null;
}
