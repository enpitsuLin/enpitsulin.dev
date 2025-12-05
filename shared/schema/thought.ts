import { z } from 'zod'

export const thoughtSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  mood: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
})
