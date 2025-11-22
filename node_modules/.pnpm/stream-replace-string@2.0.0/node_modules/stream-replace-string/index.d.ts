import { Transform, Readable } from 'stream';

interface Options {
    limit?: number;
    bufferReplaceStream?: boolean;
}

type ReplaceStr = string | Promise<string>;
type ReplacerFunc = (matches?: number) => ReplaceStr;

declare function replace(searchStr: string, replaceWith: ReplaceStr | ReplacerFunc | Readable, options?: Options): Transform;

export default replace;
