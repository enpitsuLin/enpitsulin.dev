import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

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

export default defineContentConfig({
  collections: {
    blog,
  },
})
