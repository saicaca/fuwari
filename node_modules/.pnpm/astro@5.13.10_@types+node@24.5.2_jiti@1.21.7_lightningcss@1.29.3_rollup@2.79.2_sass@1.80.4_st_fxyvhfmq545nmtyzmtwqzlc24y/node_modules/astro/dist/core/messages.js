import {
  bgCyan,
  bgGreen,
  bgWhite,
  bgYellow,
  black,
  blue,
  bold,
  cyan,
  dim,
  green,
  red,
  underline,
  yellow
} from "kleur/colors";
import { detect, resolveCommand } from "package-manager-detector";
import { getDocsForError, renderErrorMarkdown } from "./errors/dev/utils.js";
import {
  AstroError,
  AstroUserError,
  CompilerError
} from "./errors/index.js";
import { padMultilineString } from "./util.js";
function req({
  url,
  method,
  statusCode,
  reqTime,
  isRewrite
}) {
  const color = statusCode >= 500 ? red : statusCode >= 300 ? yellow : blue;
  return color(`[${statusCode}]`) + ` ${isRewrite ? color("(rewrite) ") : ""}` + (method && method !== "GET" ? color(method) + " " : "") + url + ` ` + (reqTime ? dim(Math.round(reqTime) + "ms") : "");
}
function serverStart({
  startupTime,
  resolvedUrls,
  host,
  base
}) {
  const version = "5.13.10";
  const localPrefix = `${dim("\u2503")} Local    `;
  const networkPrefix = `${dim("\u2503")} Network  `;
  const emptyPrefix = " ".repeat(11);
  const localUrlMessages = resolvedUrls.local.map((url, i) => {
    return `${i === 0 ? localPrefix : emptyPrefix}${cyan(new URL(url).origin + base)}`;
  });
  const networkUrlMessages = resolvedUrls.network.map((url, i) => {
    return `${i === 0 ? networkPrefix : emptyPrefix}${cyan(new URL(url).origin + base)}`;
  });
  if (networkUrlMessages.length === 0) {
    const networkLogging = getNetworkLogging(host);
    if (networkLogging === "host-to-expose") {
      networkUrlMessages.push(`${networkPrefix}${dim("use --host to expose")}`);
    } else if (networkLogging === "visible") {
      networkUrlMessages.push(`${networkPrefix}${dim("unable to find network to expose")}`);
    }
  }
  const messages = [
    "",
    `${bgGreen(bold(` astro `))} ${green(`v${version}`)} ${dim(`ready in`)} ${Math.round(
      startupTime
    )} ${dim("ms")}`,
    "",
    ...localUrlMessages,
    ...networkUrlMessages,
    ""
  ];
  return messages.filter((msg) => typeof msg === "string").join("\n");
}
function serverShortcuts({ key, label }) {
  return [dim("  Press"), key, dim("to"), label].join(" ");
}
async function newVersionAvailable({ latestVersion }) {
  const badge = bgYellow(black(` update `));
  const headline = yellow(`\u25B6 New version of Astro available: ${latestVersion}`);
  const packageManager = (await detect())?.agent ?? "npm";
  const execCommand = resolveCommand(packageManager, "execute", ["@astrojs/upgrade"]);
  const details = !execCommand ? "" : `  Run ${cyan(`${execCommand.command} ${execCommand.args.join(" ")}`)} to update`;
  return ["", `${badge} ${headline}`, details, ""].join("\n");
}
function telemetryNotice() {
  const headline = blue(`\u25B6 Astro collects anonymous usage data.`);
  const why = "  This information helps us improve Astro.";
  const disable = `  Run "astro telemetry disable" to opt-out.`;
  const details = `  ${cyan(underline("https://astro.build/telemetry"))}`;
  return [headline, why, disable, details].join("\n");
}
function telemetryEnabled() {
  return [
    green("\u25B6 Anonymous telemetry ") + bgGreen(" enabled "),
    `  Thank you for helping us improve Astro!`,
    ``
  ].join("\n");
}
function preferenceEnabled(name) {
  return `${green("\u25C9")} ${name} is now ${bgGreen(black(" enabled "))}
`;
}
function preferenceSet(name, value) {
  return `${green("\u25C9")} ${name} has been set to ${bgGreen(black(` ${JSON.stringify(value)} `))}
`;
}
function preferenceGet(name, value) {
  return `${green("\u25C9")} ${name} is set to ${bgGreen(black(` ${JSON.stringify(value)} `))}
`;
}
function preferenceDefaultIntro(name) {
  return `${yellow("\u25EF")} ${name} has not been set. It defaults to
`;
}
function preferenceDefault(name, value) {
  return `${yellow("\u25EF")} ${name} has not been set. It defaults to ${bgYellow(
    black(` ${JSON.stringify(value)} `)
  )}
`;
}
function preferenceDisabled(name) {
  return `${yellow("\u25EF")} ${name} is now ${bgYellow(black(" disabled "))}
`;
}
function preferenceReset(name) {
  return `${cyan("\u25C6")} ${name} has been ${bgCyan(black(" reset "))}
`;
}
function telemetryDisabled() {
  return [
    green("\u25B6 Anonymous telemetry ") + bgGreen(" disabled "),
    `  Astro is no longer collecting anonymous usage data.`,
    ``
  ].join("\n");
}
function telemetryReset() {
  return [green("\u25B6 Anonymous telemetry preferences reset."), ``].join("\n");
}
function fsStrictWarning() {
  const title = yellow(`\u25B6 ${bold("vite.server.fs.strict")} has been disabled!`);
  const subtitle = `  Files on your machine are likely accessible on your network.`;
  return `${title}
${subtitle}
`;
}
function prerelease({ currentVersion }) {
  const tag = currentVersion.split("-").slice(1).join("-").replace(/\..*$/, "") || "unknown";
  const badge = bgYellow(black(` ${tag} `));
  const title = yellow(`\u25B6 This is a ${badge} prerelease build!`);
  const subtitle = `  Report issues here: ${cyan(underline("https://astro.build/issues"))}`;
  return `${title}
${subtitle}
`;
}
function success(message, tip) {
  const badge = bgGreen(black(` success `));
  const headline = green(message);
  const footer = tip ? `
  \u25B6 ${tip}` : void 0;
  return ["", `${badge} ${headline}`, footer].filter((v) => v !== void 0).map((msg) => `  ${msg}`).join("\n");
}
function actionRequired(message) {
  const badge = bgYellow(black(` action required `));
  const headline = yellow(message);
  return ["", `${badge} ${headline}`].filter((v) => v !== void 0).map((msg) => `  ${msg}`).join("\n");
}
function cancelled(message, tip) {
  const badge = bgYellow(black(` cancelled `));
  const headline = yellow(message);
  const footer = tip ? `
  \u25B6 ${tip}` : void 0;
  return ["", `${badge} ${headline}`, footer].filter((v) => v !== void 0).map((msg) => `  ${msg}`).join("\n");
}
const LOCAL_IP_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1"]);
function getNetworkLogging(host) {
  if (host === false) {
    return "host-to-expose";
  } else if (typeof host === "string" && LOCAL_IP_HOSTS.has(host)) {
    return "none";
  } else {
    return "visible";
  }
}
const codeRegex = /`([^`]+)`/g;
function formatConfigErrorMessage(err) {
  const errorList = err.issues.map(
    (issue) => `! ${renderErrorMarkdown(issue.message, "cli")}`.replaceAll(codeRegex, blue("$1")).split("\n").map((line, index) => index === 0 ? red(line) : "  " + line).join("\n")
  );
  return `${red("[config]")} Astro found issue(s) with your configuration:

${errorList.join(
    "\n\n"
  )}`;
}
const STACK_LINE_REGEXP = /^\s+at /g;
const IRRELEVANT_STACK_REGEXP = /node_modules|astro[/\\]dist/g;
function formatErrorStackTrace(err, showFullStacktrace) {
  const stackLines = (err.stack || "").split("\n").filter((line) => STACK_LINE_REGEXP.test(line));
  if (showFullStacktrace) {
    return stackLines.join("\n");
  }
  const irrelevantStackIndex = stackLines.findIndex((line) => IRRELEVANT_STACK_REGEXP.test(line));
  if (irrelevantStackIndex <= 0) {
    const errorId = err.id;
    const errorLoc = err.loc;
    if (errorId || errorLoc?.file) {
      const prettyLocation = `    at ${errorId ?? errorLoc?.file}${errorLoc?.line && errorLoc.column ? `:${errorLoc.line}:${errorLoc.column}` : ""}`;
      return prettyLocation + "\n    [...] See full stack trace in the browser, or rerun with --verbose.";
    } else {
      return stackLines.join("\n");
    }
  }
  return stackLines.splice(0, irrelevantStackIndex).join("\n") + "\n    [...] See full stack trace in the browser, or rerun with --verbose.";
}
function formatErrorMessage(err, showFullStacktrace) {
  const isOurError = AstroError.is(err) || CompilerError.is(err) || AstroUserError.is(err);
  let message = "";
  if (isOurError) {
    message += red(`[${err.name}]`) + " " + renderErrorMarkdown(err.message, "cli");
  } else {
    message += err.message;
  }
  const output = [message];
  if (err.hint) {
    output.push(`  ${bold("Hint:")}`);
    output.push(yellow(padMultilineString(renderErrorMarkdown(err.hint, "cli"), 4)));
  }
  const docsLink = getDocsForError(err);
  if (docsLink) {
    output.push(`  ${bold("Error reference:")}`);
    output.push(`    ${cyan(underline(docsLink))}`);
  }
  if (showFullStacktrace && err.loc) {
    output.push(`  ${bold("Location:")}`);
    output.push(`    ${underline(`${err.loc.file}:${err.loc.line ?? 0}:${err.loc.column ?? 0}`)}`);
  }
  if (err.stack) {
    output.push(`  ${bold("Stack trace:")}`);
    output.push(dim(formatErrorStackTrace(err, showFullStacktrace)));
  }
  if (err.cause) {
    output.push(`  ${bold("Caused by:")}`);
    let causeMessage = "  ";
    if (err.cause instanceof Error) {
      causeMessage += err.cause.message + "\n" + formatErrorStackTrace(err.cause, showFullStacktrace);
    } else {
      causeMessage += JSON.stringify(err.cause);
    }
    output.push(dim(causeMessage));
  }
  return output.join("\n");
}
function printHelp({
  commandName,
  headline,
  usage,
  tables,
  description
}) {
  const linebreak = () => "";
  const title = (label) => `  ${bgWhite(black(` ${label} `))}`;
  const table = (rows, { padding }) => {
    const split = process.stdout.columns < 60;
    let raw = "";
    for (const row of rows) {
      if (split) {
        raw += `    ${row[0]}
    `;
      } else {
        raw += `${`${row[0]}`.padStart(padding)}`;
      }
      raw += "  " + dim(row[1]) + "\n";
    }
    return raw.slice(0, -1);
  };
  let message = [];
  if (headline) {
    message.push(
      linebreak(),
      `  ${bgGreen(black(` ${commandName} `))} ${green(
        `v${"5.13.10"}`
      )} ${headline}`
    );
  }
  if (usage) {
    message.push(linebreak(), `  ${green(commandName)} ${bold(usage)}`);
  }
  if (tables) {
    let calculateTablePadding2 = function(rows) {
      return rows.reduce((val, [first]) => Math.max(val, first.length), 0) + 2;
    };
    var calculateTablePadding = calculateTablePadding2;
    const tableEntries = Object.entries(tables);
    const padding = Math.max(...tableEntries.map(([, rows]) => calculateTablePadding2(rows)));
    for (const [tableTitle, tableRows] of tableEntries) {
      message.push(linebreak(), title(tableTitle), table(tableRows, { padding }));
    }
  }
  if (description) {
    message.push(linebreak(), `${description}`);
  }
  console.log(message.join("\n") + "\n");
}
export {
  actionRequired,
  cancelled,
  formatConfigErrorMessage,
  formatErrorMessage,
  fsStrictWarning,
  newVersionAvailable,
  preferenceDefault,
  preferenceDefaultIntro,
  preferenceDisabled,
  preferenceEnabled,
  preferenceGet,
  preferenceReset,
  preferenceSet,
  prerelease,
  printHelp,
  req,
  serverShortcuts,
  serverStart,
  success,
  telemetryDisabled,
  telemetryEnabled,
  telemetryNotice,
  telemetryReset
};
