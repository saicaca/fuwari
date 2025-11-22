import { spawn, spawnSync } from "node:child_process";
import { arch, platform } from "node:os";
import * as colors from "kleur/colors";
import prompts from "prompts";
import { resolveConfig } from "../../core/config/index.js";
import { ASTRO_VERSION } from "../../core/constants.js";
import { apply as applyPolyfill } from "../../core/polyfill.js";
import { flagsToAstroInlineConfig } from "../flags.js";
async function getInfoOutput({
  userConfig,
  print
}) {
  const packageManager = getPackageManager();
  const rows = [
    ["Astro", `v${ASTRO_VERSION}`],
    ["Node", process.version],
    ["System", getSystem()],
    ["Package Manager", packageManager]
  ];
  if (print) {
    const viteVersion = await getVersion(packageManager, "vite");
    if (viteVersion) {
      rows.splice(1, 0, ["Vite", viteVersion]);
    }
  }
  const hasAdapter = "adapter" in userConfig && userConfig.adapter?.name;
  let adapterVersion = void 0;
  if (print && hasAdapter) {
    adapterVersion = await getVersion(packageManager, userConfig.adapter.name);
  }
  const adatperOutputString = hasAdapter ? `${userConfig.adapter.name}${adapterVersion ? ` (${adapterVersion})` : ""}` : "none";
  try {
    rows.push([
      "Output",
      "adapter" in userConfig && userConfig.output ? userConfig.output : "static"
    ]);
    rows.push(["Adapter", adatperOutputString]);
    const integrations = (userConfig?.integrations ?? []).filter(Boolean).flat().map(async (i) => {
      if (!i.name) return;
      if (!print) return i.name;
      const version = await getVersion(packageManager, i.name);
      return `${i.name}${version ? ` (${version})` : ""}`;
    });
    const awaitedIntegrations = (await Promise.all(integrations)).filter(Boolean);
    rows.push(["Integrations", awaitedIntegrations.length > 0 ? awaitedIntegrations : "none"]);
  } catch {
  }
  let output = "";
  for (const [label, value] of rows) {
    output += printRow(label, value, print);
  }
  return output.trim();
}
async function printInfo({ flags }) {
  applyPolyfill();
  const { userConfig } = await resolveConfig(flagsToAstroInlineConfig(flags), "info");
  const output = await getInfoOutput({ userConfig, print: true });
  await copyToClipboard(output, flags.copy);
}
async function copyToClipboard(text, force) {
  text = text.trim();
  const system = platform();
  let command = "";
  let args = [];
  if (system === "darwin") {
    command = "pbcopy";
  } else if (system === "win32") {
    command = "clip";
  } else {
    const unixCommands = [
      ["xclip", ["-selection", "clipboard", "-l", "1"]],
      ["wl-copy", []]
    ];
    for (const [unixCommand, unixArgs] of unixCommands) {
      try {
        const output = spawnSync("which", [unixCommand], { encoding: "utf8" });
        if (output.stdout.trim()) {
          command = unixCommand;
          args = unixArgs;
          break;
        }
      } catch {
        continue;
      }
    }
  }
  if (!command) {
    console.error(colors.red("\nClipboard command not found!"));
    console.info("Please manually copy the text above.");
    return;
  }
  if (!force) {
    const { shouldCopy } = await prompts({
      type: "confirm",
      name: "shouldCopy",
      message: "Copy to clipboard?",
      initial: true
    });
    if (!shouldCopy) return;
  }
  try {
    const result = spawnSync(command, args, { input: text, stdio: ["pipe", "ignore", "ignore"] });
    if (result.error) {
      throw result.error;
    }
    console.info(colors.green("Copied to clipboard!"));
  } catch {
    console.error(
      colors.red(`
Sorry, something went wrong!`) + ` Please copy the text above manually.`
    );
  }
}
function readFromClipboard() {
  const system = platform();
  let command = "";
  let args = [];
  if (system === "darwin") {
    command = "pbpaste";
  } else if (system === "win32") {
    command = "powershell";
    args = ["-command", "Get-Clipboard"];
  } else {
    const unixCommands = [
      ["xclip", ["-sel", "clipboard", "-o"]],
      ["wl-paste", []]
    ];
    for (const [unixCommand, unixArgs] of unixCommands) {
      try {
        const output = spawnSync("which", [unixCommand], { encoding: "utf8" });
        if (output.stdout.trim()) {
          command = unixCommand;
          args = unixArgs;
          break;
        }
      } catch {
        continue;
      }
    }
  }
  if (!command) {
    throw new Error("Clipboard read command not found!");
  }
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  return result.stdout.trim();
}
const PLATFORM_TO_OS = {
  darwin: "macOS",
  win32: "Windows",
  linux: "Linux"
};
function getSystem() {
  const system = PLATFORM_TO_OS[platform()] ?? platform();
  return `${system} (${arch()})`;
}
function getPackageManager() {
  if (!process.env.npm_config_user_agent) {
    return "unknown";
  }
  const specifier = process.env.npm_config_user_agent.split(" ")[0];
  const name = specifier.substring(0, specifier.lastIndexOf("/"));
  return name === "npminstall" ? "cnpm" : name;
}
const MAX_PADDING = 25;
function printRow(label, value, print) {
  const padding = MAX_PADDING - label.length;
  const [first, ...rest] = Array.isArray(value) ? value : [value];
  let plaintext = `${label}${" ".repeat(padding)}${first}`;
  let richtext = `${colors.bold(label)}${" ".repeat(padding)}${colors.green(first)}`;
  if (rest.length > 0) {
    for (const entry of rest) {
      plaintext += `
${" ".repeat(MAX_PADDING)}${entry}`;
      richtext += `
${" ".repeat(MAX_PADDING)}${colors.green(entry)}`;
    }
  }
  plaintext += "\n";
  if (print) {
    console.info(richtext);
  }
  return plaintext;
}
function formatPnpmVersionOutput(versionOutput) {
  return versionOutput.startsWith("link:") ? "Local" : `v${versionOutput}`;
}
async function spawnAsync(executable, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, opts, { shell: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => stdout += d);
    child.stderr.on("data", (d) => stderr += d);
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(stderr));
      else resolve(stdout);
    });
  });
}
async function getVersionUsingPNPM(dependency) {
  const output = await spawnAsync("pnpm", ["why", dependency, "--json"]);
  const parsedOutput = JSON.parse(output);
  const deps = parsedOutput[0].dependencies;
  if (parsedOutput.length === 0 || !deps) {
    return void 0;
  }
  const userProvidedDependency = deps[dependency];
  if (userProvidedDependency) {
    return userProvidedDependency.version.startsWith("link:") ? "Local" : `v${userProvidedDependency.version}`;
  }
  const astroDependency = deps.astro?.dependencies[dependency];
  return astroDependency ? formatPnpmVersionOutput(astroDependency.version) : void 0;
}
async function getVersionUsingNPM(dependency) {
  const output = await spawnAsync("npm", ["ls", dependency, "--json", "--depth=1"]);
  const parsedNpmOutput = JSON.parse(output);
  if (!parsedNpmOutput.dependencies) {
    return void 0;
  }
  if (parsedNpmOutput.dependencies[dependency]) {
    return `v${parsedNpmOutput.dependencies[dependency].version}`;
  }
  const astro = parsedNpmOutput.dependencies.astro;
  return astro ? `v${astro.dependencies[dependency].version}` : void 0;
}
function getYarnOutputDepVersion(dependency, outputLine) {
  const parsed = JSON.parse(outputLine);
  for (const [key, value] of Object.entries(parsed.children)) {
    if (key.startsWith(`${dependency}@`)) {
      return `v${value.locator.split(":").pop()}`;
    }
  }
}
async function getVersionUsingYarn(dependency) {
  const yarnOutput = await spawnAsync("yarn", ["why", dependency, "--json"]);
  const hasUserDefinition = yarnOutput.includes("workspace:.");
  for (const line of yarnOutput.split("\n")) {
    if (hasUserDefinition && line.includes("workspace:."))
      return getYarnOutputDepVersion(dependency, line);
    if (!hasUserDefinition && line.includes("astro@"))
      return getYarnOutputDepVersion(dependency, line);
  }
}
async function getVersion(packageManager, dependency) {
  try {
    switch (packageManager) {
      case "pnpm":
        return await getVersionUsingPNPM(dependency);
      case "npm":
        return getVersionUsingNPM(dependency);
      case "yarn":
        return getVersionUsingYarn(dependency);
      case "bun":
        return void 0;
    }
    return void 0;
  } catch (err) {
    console.error(err);
    return void 0;
  }
}
export {
  getInfoOutput,
  printInfo,
  readFromClipboard
};
