import { z } from 'zod'

// Post form validation schema
export const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  slug: z.string().min(1, 'Slug 不能为空'),
  content: z.string().min(1, '内容不能为空'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
})

export type PostFormData = z.infer<typeof postSchema>
