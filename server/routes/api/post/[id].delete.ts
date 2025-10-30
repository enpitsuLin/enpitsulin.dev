import { eq } from 'drizzle-orm'
import { defineHandler, getRouterParam, HTTPError } from 'h3'
import { post } from '~~/server/database/schema'
import { useDrizzle } from '~~/server/utils/drizzle'

export default defineHandler(async (event) => {
  event.context.auth.assertAuth('admin')

  const db = useDrizzle()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw new HTTPError({
      status: 400,
      message: 'Post ID is required',
    })
  }

  // Check if post exists
  const existingPost = await db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw new HTTPError({
      status: 404,
      message: 'Post not found',
    })
  }

  // Delete post (cascade will handle postTag relationships)
  await db
    .delete(post)
    .where(eq(post.id, id))

  return { success: true }
})
