import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const blog = defineCollection({
  type: 'page',
  source: 'blog/**.md',
  schema: z.object({
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    tags: z.array(z.string()),
    excerpt: z.object({
      type: z.string(),
      children: z.any(),
    }),
    meta: z.object({
      slug: z.string(),
      estimation: z.object({
        text: z.string(),
        minutes: z.number(),
        time: z.number(),
        words: z.number(),
      }),
    }),
  }),
})

const about = defineCollection({
  type: 'page',
  source: 'about.md',
})

export default defineContentConfig({
  collections: {
    blog,
    about,
  },
})
