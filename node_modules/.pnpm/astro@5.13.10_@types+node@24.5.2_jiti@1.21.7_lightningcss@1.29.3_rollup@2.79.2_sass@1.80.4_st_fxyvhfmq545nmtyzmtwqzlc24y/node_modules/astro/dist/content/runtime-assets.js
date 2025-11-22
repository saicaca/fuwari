import { z } from "zod";
import { emitESMImage } from "../assets/utils/node/emitAsset.js";
function createImage(pluginContext, shouldEmitFile, entryFilePath, experimentalSvgEnabled) {
  return () => {
    return z.string().transform(async (imagePath, ctx) => {
      const resolvedFilePath = (await pluginContext.resolve(imagePath, entryFilePath))?.id;
      const metadata = await emitESMImage(
        resolvedFilePath,
        pluginContext.meta.watchMode,
        // FUTURE: Remove in this in v6
        experimentalSvgEnabled,
        shouldEmitFile ? pluginContext.emitFile : void 0
      );
      if (!metadata) {
        ctx.addIssue({
          code: "custom",
          message: `Image ${imagePath} does not exist. Is the path correct?`,
          fatal: true
        });
        return z.never();
      }
      return { ...metadata, ASTRO_ASSET: metadata.fsPath };
    });
  };
}
export {
  createImage
};
