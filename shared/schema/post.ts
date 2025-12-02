import { z } from 'zod'

export const postSchema = z.object({
  slug: z.string().min(1),
  tags: z.array(z.string()).optional(),
  content: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
})
