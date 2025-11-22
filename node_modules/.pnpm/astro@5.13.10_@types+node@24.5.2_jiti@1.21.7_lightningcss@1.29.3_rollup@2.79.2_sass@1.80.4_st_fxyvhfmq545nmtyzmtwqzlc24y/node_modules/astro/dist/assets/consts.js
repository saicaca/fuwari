const VIRTUAL_MODULE_ID = "astro:assets";
const VIRTUAL_SERVICE_ID = "virtual:image-service";
const VALID_INPUT_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "webp",
  "gif",
  "svg",
  "avif"
];
const VALID_SUPPORTED_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "webp",
  "gif",
  "svg",
  "avif"
];
const DEFAULT_OUTPUT_FORMAT = "webp";
const VALID_OUTPUT_FORMATS = ["avif", "png", "webp", "jpeg", "jpg", "svg"];
const DEFAULT_HASH_PROPS = [
  "src",
  "width",
  "height",
  "format",
  "quality",
  "fit",
  "position"
];
export {
  DEFAULT_HASH_PROPS,
  DEFAULT_OUTPUT_FORMAT,
  VALID_INPUT_FORMATS,
  VALID_OUTPUT_FORMATS,
  VALID_SUPPORTED_FORMATS,
  VIRTUAL_MODULE_ID,
  VIRTUAL_SERVICE_ID
};
