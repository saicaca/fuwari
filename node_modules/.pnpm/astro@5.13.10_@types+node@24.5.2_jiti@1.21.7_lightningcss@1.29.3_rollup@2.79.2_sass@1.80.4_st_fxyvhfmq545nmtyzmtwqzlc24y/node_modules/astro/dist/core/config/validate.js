import { errorMap } from "../errors/index.js";
import { AstroConfigRefinedSchema, createRelativeSchema } from "./schemas/index.js";
async function validateConfig(userConfig, root, cmd) {
  const AstroConfigRelativeSchema = createRelativeSchema(cmd, root);
  return await validateConfigRefined(
    await AstroConfigRelativeSchema.parseAsync(userConfig, { errorMap })
  );
}
async function validateConfigRefined(updatedConfig) {
  return await AstroConfigRefinedSchema.parseAsync(updatedConfig, { errorMap });
}
export {
  validateConfig,
  validateConfigRefined
};
