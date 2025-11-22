export default function html(): {
    name: string;
    options(options: any): void;
    transform(source: string, id: string): Promise<{
        code: string;
        map: import("magic-string").SourceMap;
    } | undefined>;
};
