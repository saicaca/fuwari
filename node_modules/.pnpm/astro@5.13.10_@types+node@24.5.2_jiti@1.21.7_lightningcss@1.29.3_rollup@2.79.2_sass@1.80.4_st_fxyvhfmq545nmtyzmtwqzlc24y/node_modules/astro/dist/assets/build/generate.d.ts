import type { BuildPipeline } from '../../core/build/pipeline.js';
import type { Logger } from '../../core/logger/core.js';
import type { MapValue } from '../../type-utils.js';
import type { AstroConfig } from '../../types/public/config.js';
import type { AssetsGlobalStaticImagesList } from '../types.js';
type AssetEnv = {
    logger: Logger;
    isSSR: boolean;
    count: {
        total: number;
        current: number;
    };
    useCache: boolean;
    assetsCacheDir: URL;
    serverRoot: URL;
    clientRoot: URL;
    imageConfig: AstroConfig['image'];
    assetsFolder: AstroConfig['build']['assets'];
};
export declare function prepareAssetsGenerationEnv(pipeline: BuildPipeline, totalCount: number): Promise<AssetEnv>;
export declare function generateImagesForPath(originalFilePath: string, transformsAndPath: MapValue<AssetsGlobalStaticImagesList>, env: AssetEnv): Promise<void>;
export declare function getStaticImageList(): AssetsGlobalStaticImagesList;
export {};
