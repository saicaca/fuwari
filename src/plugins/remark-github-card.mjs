/* With <3 by Fabrizz https://github.com/Fabrizz */ 

import { visit } from 'unist-util-visit'

const REGEX_REPO_MATCHER = /\[!GITHUB\s([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)\]/

/**
 * Custom Remark plugin function that transforms the html-markdown into a Github profile card.
 *
 * @returns {Function} The transformer function for remark.
 */
const plugin = function () {
  return (tree) => {
    visit(
      tree,
      handleNode(),
    )
  }
}
export default plugin

const handleNode = (config) => (node) => {
  try {
    // The node should be a blockquote
    if (node.type != 'blockquote') return;
    const blockquote = node
      
    // The blockquote should have a paragraph as its first child
    if (blockquote.children[0]?.type != 'paragraph') return;
    const paragraph = blockquote.children[0]

    // The paragraph should have a text as its first child
    if (paragraph.children[0]?.type != 'text') return;
    const text = paragraph.children[0]

    // If the block is multi-line, skip it
    if (!(text.value.indexOf('\n') < 0)) return;

    // The single blockquote text should match the regex
    const match = REGEX_REPO_MATCHER.exec(text.value);
    if (!match) return;

    // Create card elements
    const cardUuid = Math.random().toString(36).slice(-6) // Collisions are not important

    // Insert the title element and add classes for the title // 
    const repoTitle = {
      data: {
        type: 'div',
        hProperties: {
          className: "gc-name",
          id: `${cardUuid}-name`
        }
      },
      children: [{
        type: "text",
        value: match[1]
      }]
    }
    const repoDescription = {
      data: {
        type: 'div',
        hProperties: {
          className: "gc-description",
          id: `${cardUuid}-description`
        }
      },
      children: [{
        type: "text",
        value: "Waiting for api.github.com..."
      }]
    }
    const repoMainLanguage = {
      data: {
        type: 'div',
        hProperties: {
          className: "gc-language",
          id: `${cardUuid}-language`
        }
      },
      children: [{
        type: "text",
        value: "Waiting..."
      }]
    }
    const repoStars = {
      data: {
        type: 'div',
        hProperties: {
          className: "gc-forks",
          id: `${cardUuid}-forks`
        }
      },
      children: [{
        type: "text",
        value: "00K"
      }]
    }
    const repoForks = {
      data: {
        type: 'div',
        hProperties: {
          className: "gc-stars",
          id: `${cardUuid}-stars`
        }
      },
      children: [{
        type: "text",
        value: "00K"
      }]
    }
    const repoOwnerAvatar = {
      data: {
        type: 'div',
        hProperties: {
          className: "avatar",
          id: `${cardUuid}-avatar`,
          style: "background-color: var(--primary);"
        }
      },
    }

    const repoLicense = {
      data: {
        type: 'div',
        hProperties: {
          className: "gc-license",
          id: `${cardUuid}-license`
        }
      },
      children: [{
        type: "text",
        value: "Waiting..."
      }]
    }
    const script = {
      data: {
        hName: "script",
        hProperties: {
          type: "text/javascript"
        }
      },
      children: [{
        type: "text",
        value: `
        fetch('https://api.github.com/repos/${match[1]}').then(response => response.json()).then(data => {
          document.getElementById('${cardUuid}-card').href = data.html_url;
          document.getElementById('${cardUuid}-description').innerText = data.description.replace(/:[a-zA-Z0-9_]+:/g, '');
          document.getElementById('${cardUuid}-language').innerText = data.language;
          document.getElementById('${cardUuid}-forks').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.forks).replaceAll("\u202f", '');
          document.getElementById('${cardUuid}-stars').innerText = Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count).replaceAll("\u202f", '');
          const avatarEl = document.getElementById('${cardUuid}-avatar');
          avatarEl.style.backgroundImage = 'url(' + data.owner.avatar_url + ')';
          avatarEl.style.backgroundColor = 'transparent';
          if (data.license?.spdx_id) {
            document.getElementById('${cardUuid}-license').innerText = data.license?.spdx_id
          } else {
            document.getElementById('${cardUuid}-license').classList.add = "no-license"
          };
          document.getElementById('${cardUuid}-card').classList.remove("fetch-waiting");
          console.log("[GITHUB-CARD] Loaded card for ${match[1]} | ${cardUuid}.")
        })
      `}]
    }

    blockquote.children = [
      repoOwnerAvatar,
      repoTitle,
      repoDescription,
      repoMainLanguage,
      {
        data: {
          hName: 'div',
          hProperties: { className: "gc-snackbar" }
        },
        children: [ repoStars, repoForks, repoLicense ]
      },
      script,
    ]
    blockquote.data = {
      ...blockquote.data,
      hProperties: {
        className: "card-github fetch-waiting",
        "data-card-uuid": `${cardUuid}`,
        "data-card-extrated": `${match[1]}`,
        id: `${cardUuid}-card`,
        href: "",
      },
      hName: 'a',
    }
  } catch (error) {
    console.error("[remark-github-card]", error)
    return;
  }
}