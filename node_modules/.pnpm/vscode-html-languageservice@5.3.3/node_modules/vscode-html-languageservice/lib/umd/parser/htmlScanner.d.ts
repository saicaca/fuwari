import { ScannerState, Scanner } from '../htmlLanguageTypes';
export declare function createScanner(input: string, initialOffset?: number, initialState?: ScannerState, emitPseudoCloseTags?: boolean): Scanner;
