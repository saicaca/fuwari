import { Options, Callback } from './utils';
declare function live(command: string | string[], options?: Options): number | null;
declare function live(command: string | string[], callback: Callback): number | null;
declare function live(command: string | string[], options: Options | undefined, callback: Callback): number | null;
export = live;
