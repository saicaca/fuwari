declare module "virtual:astro-icon" {
  const icons: import("./integration").AstroIconCollectionMap;
  export default icons;
  export const config: import("./integration").IntegrationOptions;
}
