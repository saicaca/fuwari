import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { siteConfig } from '@/config';

/**
 * Route for dynamic Open Graph images.
 * This function will generate Open Graph images only if enabled in `config.ts`. 
 *
 * @returns {Promise<object>} An object containing the `OGImageRoute` or an empty object if disabled.
 */
async function getOpenGraphData() {
  if (siteConfig.openGraph.postImage.dynamicImage) {
    const posts = await getCollection("posts");
    const pages = Object.fromEntries(
      posts.map(({ id, slug, data }) => [id, { data, slug }]),
    );
    return OGImageRoute({
      param: 'route',
      pages,
      getImageOptions: async (_, { data, slug }: (typeof pages)[string]) => ({
        title: data.title,
        description: data.description,
        ...siteConfig.openGraph.postImage.dynamicImageConfig || {},
      }),
    });
  } else {
    return { getStaticPaths: {}, GET: {} } ;
  }
}

export const { getStaticPaths, GET } = await getOpenGraphData();
