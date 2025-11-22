import { printHelp } from "../../core/messages.js";
import { openInBrowser } from "./open.js";
async function docs({ flags }) {
  if (flags.help || flags.h) {
    printHelp({
      commandName: "astro docs",
      tables: {
        Flags: [["--help (-h)", "See all available flags."]]
      },
      description: `Launches the Astro Docs website directly from the terminal.`
    });
    return;
  }
  return await openInBrowser("https://docs.astro.build/");
}
export {
  docs
};
