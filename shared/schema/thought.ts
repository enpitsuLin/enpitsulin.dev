import { z } from 'zod'

export const thoughtSchema = z.object({
  content: z.string().min(1),
  mood: z.string().optional(),
})
