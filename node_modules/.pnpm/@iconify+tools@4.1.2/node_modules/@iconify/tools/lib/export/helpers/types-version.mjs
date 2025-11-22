import 'local-pkg';
import 'fs';

async function getTypesVersion() {
  throw new Error(
    `getTypesVersion() is deprecated, use wildcard to make packages work with all versions`
  );
}

export { getTypesVersion };
