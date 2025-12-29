/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a GitHub File Card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The GitHub repository in the format "owner/repo".
 * @param {string} properties.file - The file path in the repository.
 * @param {string} properties.description
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created GitHub File Card component.
 */
export function GithubFileCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("githubfile" directive must be leaf type "::githubfile{repo="owner/repo" file="path/to/file"}")',
		]);

	if (!properties.repo || !properties.repo.includes("/"))
		return h(
			"div",
			{ class: "hidden" },
			'Invalid repository. ("repo" attribute must be in the format "owner/repo")',
		);

	const filePath = properties.file || properties.path;
	if (!filePath)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid file. ("file" attribute must be set to a repo path like "path/to/file.ext")',
		);

	const description = properties.description || "No description";

	const repo = properties.repo;
	const owner = repo.split("/")[0];
	const repoName = repo.split("/")[1];
	const ref = properties.ref || "HEAD";
	const fileName = filePath.split("/").filter(Boolean).pop();
	if (!fileName)
		return h(
			"div",
			{ class: "hidden" },
			'Invalid file. ("file" attribute must include a file name)',
		);

	const fileTypeLabel = fileName.includes(".")
		? fileName.split(".").pop().toLowerCase()
		: "file";

	const encodedFilePath = filePath
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
	const refQuery = ref === "HEAD" ? "" : `?ref=${encodeURIComponent(ref)}`;
	const contentsUrl = `https://api.github.com/repos/${repo}/contents/${encodedFilePath}${refQuery}`;
	const commitRefQuery =
		ref === "HEAD" ? "" : `&sha=${encodeURIComponent(ref)}`;
	const commitsUrl = `https://api.github.com/repos/${repo}/commits?path=${encodeURIComponent(filePath)}&per_page=1${commitRefQuery}`;

	const cardUuid = `GFC${Math.random().toString(36).slice(-6)}`; // Collisions are not important
	const fileUrl = encodeURI(
		`https://github.com/${repo}/blob/${ref}/${filePath}`,
	);

	const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				nAvatar,
				h("div", { class: "gc-user" }, owner),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-user" }, repoName),
			h("div", { class: "gc-divider" }, "/"),
			h("div", { class: "gc-repo" }, fileName),
		]),
		h("div", { class: "github-logo" }),
	]);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "gc-description" },
		description,
	);

	const nFileType = h(
		`div#${cardUuid}-filetype`,
		{ class: "gc-filetype" },
		fileTypeLabel,
	);
	const nFileSize = h(
		`div#${cardUuid}-filesize`,
		{ class: "gc-filesize" },
		"...",
	);
	const nUpdated = h(`div#${cardUuid}-updated`, { class: "gc-updated" }, "...");
	const nInfoBar = h("div", { class: "gc-infobar" }, [
		nFileType,
		nFileSize,
		nUpdated,
	]);

	const nScript = h(
		`script#${cardUuid}-script`,
		{ type: "text/javascript", defer: true },
		`
      const initGithubFileCard = () => {
        const cardEl = document.getElementById('${cardUuid}-card');
        const avatarEl = document.getElementById('${cardUuid}-avatar');
        const fileTypeEl = document.getElementById('${cardUuid}-filetype');
        const fileSizeEl = document.getElementById('${cardUuid}-filesize');
        const updatedEl = document.getElementById('${cardUuid}-updated');
        if (!cardEl || !avatarEl || !fileTypeEl || !fileSizeEl || !updatedEl) {
          console.warn("[GITHUB-FILE-CARD] Missing card elements for ${repo} | ${cardUuid}.");
          return;
        }

        const formatBytes = (bytes) => {
          if (typeof bytes !== "number" || Number.isNaN(bytes)) return "unknown";
          const units = ["B", "KB", "MB", "GB", "TB"];
          let size = bytes;
          let unit = 0;
          while (size >= 1024 && unit < units.length - 1) {
            size /= 1024;
            unit += 1;
          }
          const precision = size < 10 && unit > 0 ? 1 : 0;
          return size.toFixed(precision) + units[unit];
        };

        const formatDate = (isoString) => {
          if (!isoString) return "unknown";
          const date = new Date(isoString);
          if (Number.isNaN(date.getTime())) return "unknown";
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          });
        };

        const repoFetch = fetch('https://api.github.com/repos/${repo}', { referrerPolicy: "no-referrer" })
          .then(response => response.json())
          .then(data => {
            const avatarUrl = data?.owner?.avatar_url || 'https://github.com/${owner}.png?size=96';
            avatarEl.style.backgroundImage = 'url(' + avatarUrl + ')';
            avatarEl.style.backgroundColor = 'transparent';
          })
          .catch(() => {
            console.warn("[GITHUB-FILE-CARD] (Error) Loading avatar for ${repo} | ${cardUuid}.");
          });

        const contentsFetch = fetch('${contentsUrl}', { referrerPolicy: "no-referrer" })
          .then(response => response.json())
          .then(data => {
            fileSizeEl.innerText = formatBytes(data?.size);
          })
          .catch(() => {
            fileSizeEl.innerText = "unknown";
            console.warn("[GITHUB-FILE-CARD] (Error) Loading file size for ${repo} | ${cardUuid}.");
          });

        const commitsFetch = fetch('${commitsUrl}', { referrerPolicy: "no-referrer" })
          .then(response => response.json())
          .then(data => {
            const commitDate = data?.[0]?.commit?.committer?.date || data?.[0]?.commit?.author?.date;
            updatedEl.innerText = formatDate(commitDate);
          })
          .catch(() => {
            updatedEl.innerText = "unknown";
            console.warn("[GITHUB-FILE-CARD] (Error) Loading commit date for ${repo} | ${cardUuid}.");
          });

        Promise.allSettled([repoFetch, contentsFetch, commitsFetch]).then(() => {
          cardEl.classList.remove("fetch-waiting");
          console.log("[GITHUB-FILE-CARD] Loaded card for ${repo} | ${cardUuid}.");
        });
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initGithubFileCard, { once: true });
      } else {
        initGithubFileCard();
      }
    `,
	);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-github card-github-file fetch-waiting no-styling",
			href: fileUrl,
			target: "_blank",
			repo,
			file: filePath,
			ref,
		},
		[nTitle, nDescription, nInfoBar, nScript],
	);
}
