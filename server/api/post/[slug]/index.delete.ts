import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { kv } from 'hub:kv'
import { z } from 'zod'

const paramsSchema = z.object({
  slug: z.string().min(1),
})

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { slug } = validateParams.data

  const existingPost = await db.query.post.findFirst({
    where: eq(schema.post.slug, slug),
  })

  if (!existingPost) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  // Soft delete post from database
  await db
    .update(schema.post)
    .set({ isDelete: true })
    .where(eq(schema.post.id, existingPost.id))

  // Delete post content from KV storage
  const kvKey = `post:${slug}`
  await kv.remove(kvKey)

  return { success: true, message: 'Post deleted successfully' }
})
