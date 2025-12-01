import { z } from 'zod'

// Post form schema for POST and PATCH requests
export const postSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  excerpt: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
})

// Query schema for GET /api/post list endpoint
export const postQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().optional(),
})

// Parameter schemas
export const postIdParamSchema = z.object({
  id: z.string(),
})

export const postSlugParamSchema = z.object({
  slug: z.string(),
})

export const postTagParamSchema = z.object({
  tag: z.string(),
})
