/**
 * Basic document structure
 */
interface FigmaBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface BaseFigmaNode {
    id: string;
    name: string;
}
interface GenericFigmaNode extends BaseFigmaNode {
    type: string;
    children?: FigmaNode[];
}
interface IconFigmaNode extends BaseFigmaNode {
    type: 'FRAME' | 'COMPONENT' | 'INSTANCE';
    clipsContent?: boolean;
    absoluteBoundingBox?: FigmaBoundingBox;
    children: FigmaNode[];
}
interface FigmaDocumentNode extends BaseFigmaNode {
    type: 'DOCUMENT';
    children: FigmaNode[];
}
type FigmaNode = GenericFigmaNode | IconFigmaNode;
/**
 * Document response from API
 */
interface FigmaDocument {
    document: FigmaDocumentNode;
    name: string;
    version: string;
    lastModified: string;
    thumbnailUrl: string;
    role: string;
    editorType: 'figma' | 'figjam';
}
interface FigmaAPIError {
    status: number;
    err: string;
}
/**
 * Result for retrieved icons
 */
interface FigmaAPIImagesResponse {
    err?: string | null;
    images: Record<string, string | null>;
}

export type { FigmaAPIError, FigmaAPIImagesResponse, FigmaDocument, FigmaDocumentNode, FigmaNode, IconFigmaNode };
