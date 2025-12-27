import type { SelectPost } from 'hub:db:schema'
import { asc, desc } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { z } from 'zod'

const paramsSchema = z.object({
  slug: z.string(),
})

export default eventHandler(async (event) => {
  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { slug } = validateParams.data

  // Find current post
  const currentPost = await db.query.post.findFirst({
    where: (post, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(post.slug, slug),
        eqFn(post.isDelete, false),
      ),
  })

  if (!currentPost || !currentPost.publishedAt) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  const currentPublishedAt = currentPost.publishedAt

  // Find previous post (published before current, ordered by publishedAt desc)
  const previousPost = await db.query.post.findFirst({
    where: (post, { and, eq: eqFn, isNotNull: isNotNullFn, lt: ltFn }) =>
      and(
        isNotNullFn(post.publishedAt),
        eqFn(post.isDelete, false),
        ltFn(post.publishedAt, currentPublishedAt),
      ),
    orderBy: desc(schema.post.publishedAt),
  })

  // Find next post (published after current, ordered by publishedAt asc)
  const nextPost = await db.query.post.findFirst({
    where: (post, { and, eq: eqFn, isNotNull: isNotNullFn, gt: gtFn }) =>
      and(
        isNotNullFn(post.publishedAt),
        eqFn(post.isDelete, false),
        gtFn(post.publishedAt, currentPublishedAt),
      ),
    orderBy: asc(schema.post.publishedAt),
  })

  // Get post info from database (title is now in database)
  const getPostInfo = (post?: SelectPost) => {
    if (!post)
      return null
    return {
      slug: post.slug,
      title: post.title,
    }
  }

  return {
    previous: getPostInfo(previousPost),
    next: getPostInfo(nextPost),
  }
})
