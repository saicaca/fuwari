---
title: Markdown extended features
published: 2024-05-01
description: 'Read more about Markdown features in Fuwari'
image: ''
tags: [Demo, Example, Markdown, Fuwari]
category: 'Examlpes'
draft: false 
---

## Github repository cards
You can add dynamic cards that link to Github repositories, on page load, the repository information is pulled from the Github API. `::github{repo="saicaca/fuwari"}`

::github{repo="Fabrizz/MMM-OnSpotify"}


## Admonitions, notes, containers
Fuwari supports admonitions of type: `tip, note, important, warning, caution`

:::note
This is a note, other frameworks call them containers or alerts
:::

:::tip{title="TIP"}
This is a tip, you can change the title using the title property: `:::tip{title="Custom title"} \`
:::

:::important
Drink 8 glasses of water!
:::

:::warning
You should star the [Fuwari repository](https://github.com/saicaca/fuwari)
:::

:::caution
Admonitions can have other elements inside
::github{repo="saicaca/fuwari"}
:::