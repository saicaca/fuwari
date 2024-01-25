<script setup lang="ts">
import { ref, watch } from 'vue'
const keywordDesktop = ref('')
const keywordMobile = ref('')
const result = ref([])

const search = async (keyword: string, isDesktop: boolean) => {
  let panel = document.getElementById('search-panel');

  // for desktop hide panel immediately if keyword is empty
  if (!keyword && isDesktop) {
    panel.classList.add("closed");
    return
  }

  let arr = []
  if (import.meta.env.PROD) {
    const ret = await pagefind.search(keyword);
    for (const item of ret.results) {
      arr.push(await item.data())
    }
  } else {
    arr = JSON.parse('[{"url":"/","content":"Simple Guides for Fuwari. Cover image source: Source. This blog template is built with Astro. For the things that are not mentioned in this guide, you may find the answers in the Astro Docs. Front-matter of Posts. --- title: My First Blog Post published: 2023-09-09 description: This is the first post of my new Astro blog. image: ./cover.jpg tags: [Foo, Bar] category: Front-end draft: false ---AttributeDescription title. The title of the post. published. The date the post was published. description. A short description of the post. Displayed on index page. image. The cover image path of the post. 1. Start with http:// or https://: Use web image 2. Start with /: For image in public dir 3. With none of the prefixes: Relative to the markdown file. tags. The tags of the post. category. The category of the post. draft. If this post is still a draft, which won’t be displayed. Where to Place the Post Files. Your post files should be placed in src/content/posts/ directory. You can also create sub-directories to better organize your posts and assets. src/content/posts/ ├── post-1.md └── post-2/ ├── cover.png └── index.md.","word_count":187,"filters":{},"meta":{"title":"This Is a Fake Search Result"},"anchors":[{"element":"h2","id":"front-matter-of-posts","text":"Front-matter of Posts","location":34},{"element":"h2","id":"where-to-place-the-post-files","text":"Where to Place the Post Files","location":151}],"weighted_locations":[{"weight":10,"balanced_score":57600,"location":3}],"locations":[3],"raw_content":"Simple Guides for Fuwari. Cover image source: Source. This blog template is built with Astro. For the things that are not mentioned in this guide, you may find the answers in the Astro Docs. Front-matter of Posts. --- title: My First Blog Post published: 2023-09-09 description: This is the first post of my new Astro blog. image: ./cover.jpg tags: [Foo, Bar] category: Front-end draft: false ---AttributeDescription title. The title of the post. published. The date the post was published. description. A short description of the post. Displayed on index page. image. The cover image path of the post. 1. Start with http:// or https://: Use web image 2. Start with /: For image in public dir 3. With none of the prefixes: Relative to the markdown file. tags. The tags of the post. category. The category of the post. draft. If this post is still a draft, which won’t be displayed. Where to Place the Post Files. Your post files should be placed in src/content/posts/ directory. You can also create sub-directories to better organize your posts and assets. src/content/posts/ ├── post-1.md └── post-2/ ├── cover.png └── index.md.","raw_url":"/posts/guide/","excerpt":"Because the search cannot work in the <mark>dev</mark> environment.","sub_results":[{"title":"Simple Guides for Fuwari - Fuwari","url":"/posts/guide/","weighted_locations":[{"weight":10,"balanced_score":57600,"location":3}],"locations":[3],"excerpt":"Simple Guides for <mark>Fuwari.</mark> Cover image source: Source. This blog template is built with Astro. For the things that are not mentioned in this guide, you may find the answers"}]},{"url":"/","content":"About. This is the demo site for Fuwari. Sources of images used in this site. Unsplash. 星と少女 by Stella. Rabbit - v1.4 Showcase by Rabbit_YourMajesty.","word_count":25,"filters":{},"meta":{"title":"If You Want to Test the Search"},"anchors":[{"element":"h1","id":"about","text":"About","location":0},{"element":"h3","id":"sources-of-images-used-in-this-site","text":"Sources of images used in this site","location":8}],"weighted_locations":[{"weight":1,"balanced_score":576,"location":7}],"locations":[7],"raw_content":"About. This is the demo site for Fuwari. Sources of images used in this site. Unsplash. 星と少女 by Stella. Rabbit - v1.4 Showcase by Rabbit_YourMajesty.","raw_url":"/about/","excerpt":"Try running <mark>npm build && npm preview</mark> instead.","sub_results":[{"title":"About","url":"/about/#about","anchor":{"element":"h1","id":"about","text":"About","location":0},"weighted_locations":[{"weight":1,"balanced_score":576,"location":7}],"locations":[7],"excerpt":"About. This is the demo site for <mark>Fuwari.</mark>"}]}]')
  }

  if (!arr.length && isDesktop) {
      // for desktop hide panel immediately if results is empty
      panel.classList.add("closed");
      return
  }

  panel.classList.remove("closed");
  result.value = arr
}

const togglePanel = async () => {
  console.log('togglePanel')
  let panel = document.getElementById('search-panel');
  panel.classList.toggle("closed");
}

watch(keywordDesktop, async (newVal, oldVal) => {
  search(newVal, true)
})
watch(keywordMobile, async (newVal, oldVal) => {
  search(newVal, false)
})
</script>

<template>
<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
  <slot name="search-icon"></slot>
  <input placeholder="Search" v-model="keywordDesktop" @focusin="search(keywordDesktop, true)"
         class="transition-all text-sm ml-2 bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
  >
</div>

<!-- toggle btn for phone/tablet view -->
<div @click="togglePanel">
  <slot name="search-switch"></slot>
</div>

<!-- search panel -->
<div id="search-panel" class="float-panel closed search-panel absolute md:w-[30rem] top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

  <!-- search bar inside panel for phone/tablet -->
  <div id="search-bar-inside" class="flex lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
    <slot name="search-icon"></slot>
    <input placeholder="Search" v-model="keywordMobile"
           class="transition-all text-sm ml-2 bg-transparent outline-0
         h-full w-full focus:w-60 text-black/50 dark:text-white/50"
    >
  </div>

  <!-- search results -->
  <a v-for="item of result" :href="item.url"
     class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
     rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
    <div class="transition text-deep inline-flex font-bold group-hover:text-[var(--primary)]">
      {{ item.meta.title }}<slot name="arrow-icon"></slot>
    </div>
<!--    list all sub results looks bad -->
<!--    <div v-for="sub of item.sub_results" v-html="sub.excerpt" class="transition text-sm text-sub">-->
<!--    </div>-->
    <div v-html="item.excerpt" class="transition text-sm text-sub">
    </div>
  </a>
</div>
</template>

<style scoped>
</style>