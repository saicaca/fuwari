/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Creates a GitLab Card component.
 *
 * @param {Object} properties - The properties of the component.
 * @param {string} properties.repo - The Gitlab repository in the format "owner/repo".
 * @param {import('mdast').RootContent[]} children - The children elements of the component.
 * @returns {import('mdast').Parent} The created GitHub Card component.
 */
export function GitlabCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "" }, [
			'Invalid directive. ("gitlab" directive must be leaf type "::gitlab{repo="owner/repo"}")',
		]);

	if (!properties.repo || !properties.repo.includes("/"))
		return h(
			"div",
			{ class: "" },
			'Invalid repository. ("repo" attributte must be in the format "owner/repo")',
		);

	const repo = properties.repo;
	const repoE = repo.replace("/", "%2F"); // encoding by replace / to %2F
	const cardUuid = `GC${Math.random().toString(36).slice(-6)}`; // Collisions are not important

	const nAvatar = h(`div#${cardUuid}-avatar`, { class: "gc-avatar" });

	const nTitle = h("div", { class: "gc-titlebar" }, [
		h("div", { class: "gc-titlebar-left" }, [
			h("div", { class: "gc-owner" }, [
				nAvatar,
				h("div", { class: "gc-user" }, repo.split("/")[0]),
			]),
			h("div", { class: "gc-divider" }, "/"),
			h(`div#${cardUuid}-repo`, { class: "gc-repo" }, repo.split("/")[1]),
		]),
		h("div", { class: "gitlab-logo" }),
	]);

	const nDescription = h(
		`div#${cardUuid}-description`,
		{ class: "gc-description" },
		"Waiting for gitlab.com api...",
	);

	const nStars = h(`div#${cardUuid}-stars`, { class: "gc-stars" }, "00K");
	const nForks = h(`div#${cardUuid}-forks`, { class: "gc-forks" }, "0K");

	const nScript = h(
		`script#${cardUuid}-script`,
		{ type: "text/javascript", defer: true },
		`
      fetch('https://gitlab.com/api/v4/projects/${repoE}').then(response => response.json()).then(data => {
		document.getElementById('${cardUuid}-repo').innerText = data.name;
        document.getElementById('${cardUuid}-description').innerText = data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "Description not set";
        document.getElementById('${cardUuid}-forks').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.forks_count).replaceAll("\u202f", '');
        document.getElementById('${cardUuid}-stars').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.star_count).replaceAll("\u202f", '');
        
		const avatar_url = data.namespace.avatar_url;
		if (avatar_url.startsWith('/')) {
			document.getElementById('${cardUuid}-avatar').style.backgroundImage = 'url(https://gitlab.com' + avatar_url + ')';
		} else {
			document.getElementById('${cardUuid}-avatar').style.backgroundImage = 'url(' + avatar_url + ')';
		}
        document.getElementById('${cardUuid}-avatar').style.backgroundColor = 'transparent';
        document.getElementById('${cardUuid}-card').classList.remove("fetch-waiting");
        console.log("[GITLAB-CARD] Loaded card for ${repo} | ${cardUuid}.")
      }).catch(err => {
        const c = document.getElementById('${cardUuid}-card');
        c?.classList.add("fetch-error");
        console.error("[GITLAB-CARD] (Error) Loading card for ${repo} | ${cardUuid}.");
		console.error(err);
      })
    `,
	);

	return h(
		`a#${cardUuid}-card`,
		{
			class: "card-github fetch-waiting no-styling",
			href: `https://gitlab.com/${repo}`,
			target: "_blank",
			repo,
		},
		[
			nTitle,
			nDescription,
			h("div", { class: "gc-infobar" }, [nStars, nForks]),
			nScript,
		],
	);
}
