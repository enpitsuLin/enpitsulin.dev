import { z } from 'zod'

// Post form validation schema
export const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  slug: z.string().min(1, 'Slug 不能为空'),
  excerpt: z.string().optional(),
  content: z.string(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.preprocess(
    (value) => {
      if (typeof value === 'undefined' || value === null) {
        return []
      }
      if (!Array.isArray(value)) {
        return [value]
      }
      return value
    },
    z.array(z.string()),
  ),
  publishedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export type PostFormData = z.infer<typeof postSchema>
