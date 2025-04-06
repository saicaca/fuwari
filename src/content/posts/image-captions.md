---
title: Image Captions Example
published: 2025-03-13T00:00:00+00:00
description: Guide to using the image caption feature.
tags: [Markdown, Blogging, Demo]
category: Examples
draft: false
---

## About Image Captions

This feature wraps images in a `<figure>` tag only when the image carries independent meaning. If the image is part of the content and does not stand alone, it will not be enclosed in a `<figure>` tag. Only [CommonMark](https://commonmark.org/) syntax is supported.

## Usage

### Single Image

#### With Caption

Markdown:

```markdown
![A description of the image](url "An image title")
```

HTML:

```html
<figure>
  <div>
    <figure>
      <img alt="A description of the image" src="url">
      <figcaption>An image title</figcaption>
    </figure>
  </div>
</figure>
```

![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

#### Without Caption

Markdown:

```markdown
![A description of the image](url)
```

HTML:

```html
<figure>
  <div>
    <img alt="A description of the image" src="url">
  </div>
</figure>
```

![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)

### Multiple Images

When you include only images within a paragraph, they will be grouped together. Hard or soft breaks can also be used.

#### With Caption

Markdown:

```markdown
![Image 1 description](url1 "Image Title 1")  
![Image 2 description](url2 "Image Title 2")
```

HTML:

```html
<figure>
  <div>
    <figure>
      <img alt="Image 1 description" src="url1">
      <figcaption>Image Title 1</figcaption>
    </figure>
    <figure>
      <img alt="Image 2 description" src="url2">
      <figcaption>Image Title 2</figcaption>
    </figure>
  </div>
</figure>
```

![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

#### Without Caption

Markdown:

```markdown
![Image 1 description](url1)  
![Image 2 description](url2)
```

HTML:

```html
<figure>
  <div>
    <img alt="Image 1 description" src="url1">
    <img alt="Image 2 description" src="url2">
  </div>
</figure>
```

![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)  
![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)

#### With Shared Caption

Markdown:

```markdown
![Image 1 description](url1 "This becomes the caption")  
![Image 2 description](url2)
```

HTML:

```html
<figure>
  <div>
    <img alt="Image 1 description" src="url1">
    <img alt="Image 2 description" src="url2">
  </div>
  <figcaption>This becomes the caption</figcaption>
</figure>
```

![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)

### Single Image Link

#### With Caption

Markdown:

```markdown
[![A description of the image](image-url "An image title")](link-url "A link title")
```

HTML:

```html
<figure>
  <a href="link-url">
    <figure>
      <img alt="A description of the image" src="image-url">
      <figcaption>An image title</figcaption>
    </figure>
  </a>
  <figcaption>A link title</figcaption>
</figure>
```

[![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")](https://github.com/saicaca/fuwari "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

---

Markdown:

```markdown
[![A description of the image](image-url)](link-url "A link title")
```

HTML:

```html
<figure>
  <a href="link-url">
    <img alt="A description of the image" src="image-url">
  </a>
  <figcaption>A link title</figcaption>
</figure>
```

[![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)](https://github.com/saicaca/fuwari "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

---

Markdown:

```markdown
[![A description of the image](image-url "An image title")](link-url)
```

HTML:

```html
<figure>
  <a href="link-url">
    <figure>
      <img alt="A description of the image" src="image-url">
      <figcaption>An image title</figcaption>
    </figure>
  </a>
</figure>
```

[![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")](https://github.com/saicaca/fuwari)

#### Without Caption

Markdown:

```markdown
[![A description of the image](image-url)](link-url)
```

HTML:

```html
<figure>
  <a href="link-url">
    <img alt="A description of the image" src="image-url">
  </a>
</figure>
```

[![A description of the image](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)](https://github.com/saicaca/fuwari)

### Multiple Image Link

When you include only a multiple-image link within a paragraph, the images will be grouped together. Hard or soft breaks can also be used.

#### With Caption

Markdown:

```markdown
[![Image 1 description](image-url1 "Image Title 1")  
![Image 2 description](image-url2 "Image Title 2")](link-url "A link title")
```

HTML:

```html
<figure>
  <a href="link-url">
    <figure>
      <img alt="Image 1 description" src="image-url1">
      <figcaption>Image Title 1</figcaption>
    </figure>
    <figure>
      <img alt="Image 2 description" src="image-url2">
      <figcaption>Image Title 2</figcaption>
    </figure>
  </a>
  <figcaption>A link title</figcaption>
</figure>
```

[![Image 1 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
![Image 2 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")](https://github.com/saicaca/fuwari "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

---

Markdown:

```markdown
[![Image 1 description](image-url1)  
![Image 2 description](image-url2)](link-url "A link title")
```

HTML:

```html
<figure>
  <a href="link-url">
    <img alt="Image 1 description" src="image-url1">
    <img alt="Image 2 description" src="image-url2">
  </a>
  <figcaption>A link title</figcaption>
</figure>
```

[![Image 1 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)  
![Image 2 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)](https://github.com/saicaca/fuwari "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

---

Markdown:

```markdown
[![Image 1 description](image-url1 "Image Title 1")  
![Image 2 description](image-url2 "Image Title 2")](link-url)
```

HTML:

```html
<figure>
  <a href="link-url">
    <figure>
      <img alt="Image 1 description" src="image-url1">
      <figcaption>Image Title 1</figcaption>
    </figure>
    <figure>
      <img alt="Image 2 description" src="image-url2">
      <figcaption>Image Title 2</figcaption>
    </figure>
  </a>
</figure>
```

[![Image 1 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")  
![Image 2 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")](https://github.com/saicaca/fuwari)

#### Without Caption

Markdown:

```markdown
[![Image 1 description](image-url1)  
![Image 2 description](image-url2)](link-url)
```

HTML:

```html
<figure>
  <a href="link-url">
    <img alt="Image 1 description" src="image-url1">
    <img alt="Image 2 description" src="image-url2">
  </a>
</figure>
```

[![Image 1 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)  
![Image 2 description](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=640/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)](https://github.com/saicaca/fuwari)

### Root Relative Path and Relative Path

#### Root Relative Path

A root relative path refers to assets located in the `public` directory of your project.

Markdown:

```markdown
![A description of the image](/favicon/favicon-dark-128.png "An image title")
```

![A description of the image](/favicon/favicon-dark-128.png "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

#### Relative Path

A relative path refers to assets inside the `src` directory, and it is relative to the location of the current file.

Markdown:

```markdown
![A description of the image](../../assets/images/demo-avatar.png "An image title")
```

![A description of the image](../../assets/images/demo-avatar.png "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

## Options

You can specify the options in the `astro.config.mjs` file.

```javascript
...
import remarkImageCaption from "./src/plugins/remark-image-caption.ts"
...
export default defineConfig({
  ...
  markdown: {
    ...
    remarkPlugins: [
      ...
      remarkImageCaption, // Plugin here
      ...
```

| Name           | Type                 | Default | Description                                                                                                                                                      |
| -------------- | -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className      | string               | ""      | The class name to apply to the outer `<figure>` element.                                                                                                         |
| excludedPaths  | (string \| RegExp)[] | []      | An array of image paths that should be excluded from transformation. This can also be used to exclude paths like those under the `src` folder in Astro projects. |
| lazyLoad       | boolean              | false   | Set the `loading` attribute on `<img>` elements.                                                                                                                 |
| linkAttributes | LinkAttributes       |         | Set the target and relationship attributes for external links. These attributes can also be left unset to delegate handling to other plugins.                    |

### linkAttributes

| Name   | Type   | Default | Description                                                                                                                      |
| ------ | ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| target | string | ''      | Specify where to open linked documents. The default (empty) does not set a target on links.                                      |
| rel    | string | ''      | Define the relationship between the current document and the linked document. The default (empty) does not set any relationship. |
