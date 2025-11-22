import { readFile } from "node:fs/promises";
import { getIcons } from "@iconify/utils";
import { loadCollectionFromFS } from "@iconify/utils/lib/loader/fs";
import { promisify } from "node:util";
import { exec } from "node:child_process";
const execa = promisify(exec);
export default async function loadIconifyCollections({ root, include = {}, }) {
    const installedCollections = await detectInstalledCollections(root);
    // If icons are installed locally but not explicitly included, include the whole pack
    for (let name of installedCollections) {
        if (include[name] !== undefined)
            continue;
        include[name] = ["*"];
    }
    const possibleCollections = await Promise.all(installedCollections.map((collectionName) => loadCollection(collectionName).then((possibleCollection) => [collectionName, possibleCollection])));
    const collections = possibleCollections.reduce((acc, [name, collection]) => {
        if (!collection) {
            console.error(`[astro-icon] "${name}" does not appear to be a valid iconify collection! Did you install the "@iconify-json/${name}" dependency?`);
            return acc;
        }
        const requestedIcons = Array.from(new Set(include[name]));
        // Requested entire icon collection
        if (requestedIcons.length === 1 && requestedIcons[0] === "*") {
            acc[name] = collection;
            return acc;
        }
        const reducedCollection = getIcons(collection, requestedIcons);
        if (!reducedCollection) {
            console.error(`[astro-icon] "${name}" failed to load the specified icons!`);
            return acc;
        }
        else if (Object.keys(reducedCollection.icons).length !== requestedIcons.length) {
            console.error(`[astro-icon] "${name}" failed to load at least one of the specified icons! Verify the icon names are included in the icon collection.`);
        }
        acc[name] = reducedCollection;
        return acc;
    }, {});
    return collections;
}
export async function loadCollection(name, autoInstall) {
    if (!name)
        return;
    return loadCollectionFromFS(name, autoInstall);
}
async function detectInstalledCollections(root) {
    try {
        let packages = [];
        const text = await readFile(new URL("./package.json", root), {
            encoding: "utf8",
        });
        const { dependencies = {}, devDependencies = {} } = JSON.parse(text);
        packages.push(...Object.keys(dependencies));
        packages.push(...Object.keys(devDependencies));
        const collections = packages
            .filter((name) => name.startsWith("@iconify-json/"))
            .map((name) => name.replace("@iconify-json/", ""));
        return collections;
    }
    catch { }
    return [];
}
