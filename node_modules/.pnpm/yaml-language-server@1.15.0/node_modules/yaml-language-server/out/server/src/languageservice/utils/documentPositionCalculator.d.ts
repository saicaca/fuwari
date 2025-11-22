import { Position } from 'vscode-languageserver-types';
export declare function insertionPointReturnValue(pt: number): number;
export declare function binarySearch(array: number[], sought: number): number;
export declare function getLineStartPositions(text: string): number[];
export declare function getPosition(pos: number, lineStartPositions: number[]): Position;
