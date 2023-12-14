import {CollectionEntry, getCollection} from "astro:content";

export async function getSortedPosts() {
    const allBlogPosts = await getCollection("posts");
    const sorted = allBlogPosts.sort((a, b) => {
        const dateA = new Date(a.data.published);
        const dateB = new Date(b.data.published);
        return dateA > dateB ? -1 : 1;
    });

    for (let i = 1; i < sorted.length; i++) {
        sorted[i].data.nextSlug = sorted[i - 1].slug;
        sorted[i].data.nextTitle = sorted[i - 1].data.title;
    }
    for (let i = 0; i < sorted.length - 1; i++) {
        sorted[i].data.prevSlug = sorted[i + 1].slug;
        sorted[i].data.prevTitle = sorted[i + 1].data.title;
    }

    return sorted;
}

export type Tag = {
    name: string;
    count: number;
}

export async function getTagList(): Promise<Tag[]> {
    const allBlogPosts = await getCollection("posts");

    const countMap: { [key: string]: number } = {};
    allBlogPosts.map((post) => {
        post.data.tags.map((tag: string) => {
            if (!countMap[tag]) countMap[tag] = 0;
            countMap[tag]++;
        })
    });

    // sort tags
    const keys: string[] = Object.keys(countMap).sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    return keys.map((key) => ({name: key, count: countMap[key]}));
}

export type Category = {
    name: string;
    count: number;
}

export async function getCategoryList(): Promise<Category[]> {
    const allBlogPosts = await getCollection("posts");
    let count : {[key: string]: number} = {};
    allBlogPosts.map((post) => {
        if (!post.data.category) {
            return;
        }
        if (!count[post.data.category]) {
            count[post.data.category] = 0;
        }
        count[post.data.category]++;
    });

    let lst = Object.keys(count).sort((a, b) => {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    let ret : Category[] = [];
    for (const c of lst) {
        ret.push({name: c, count: count[c]});
    }
    return ret;
}