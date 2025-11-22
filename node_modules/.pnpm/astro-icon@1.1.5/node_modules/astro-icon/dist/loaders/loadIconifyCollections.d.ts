import type { AstroIconCollectionMap, IconCollection, IntegrationOptions } from "../../typings/integration";
import type { AutoInstall } from "../../typings/iconify";
interface LoadOptions {
    root: URL;
    include?: IntegrationOptions["include"];
}
export default function loadIconifyCollections({ root, include, }: LoadOptions): Promise<AstroIconCollectionMap>;
export declare function loadCollection(name: string, autoInstall?: AutoInstall): Promise<IconCollection | void>;
export {};
