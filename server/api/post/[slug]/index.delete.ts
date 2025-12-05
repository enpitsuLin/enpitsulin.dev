import { eq } from 'drizzle-orm'
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

  const drizzle = useDrizzle()
  const existingPost = await drizzle.query.post.findFirst({
    where: eq(tables.post.slug, slug),
  })

  if (!existingPost) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  // Soft delete post from database
  await drizzle
    .update(tables.post)
    .set({ isDelete: true })
    .where(eq(tables.post.id, existingPost.id))

  // Delete post content from KV storage
  const kvKey = `post:${slug}`
  await hubKV().remove(kvKey)

  return { success: true, message: 'Post deleted successfully' }
})
