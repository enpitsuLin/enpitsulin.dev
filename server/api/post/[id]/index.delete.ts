import { eq } from 'drizzle-orm'
import z from 'zod'
import { postIdParamSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  await assertAdmin(event)

  const validatedParams = await getValidatedRouterParams(event, postIdParamSchema.safeParse)

  if (validatedParams.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedParams.error),
    })
  }

  const id = validatedParams.data.id

  const db = useDrizzle()

  // Check if post exists
  const existingPost = await db
    .select({ id: tables.post.id })
    .from(tables.post)
    .where(eq(tables.post.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  // Delete post (cascade will handle postTag relationships)
  await db
    .delete(tables.post)
    .where(eq(tables.post.id, id))

  return { success: true }
})
