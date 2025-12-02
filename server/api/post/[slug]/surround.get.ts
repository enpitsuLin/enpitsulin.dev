import type { SelectPost } from '~~/server/utils/drizzle'
import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

const paramsSchema = z.object({
  slug: z.string(),
})

export default eventHandler(async (event) => {
  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { slug } = validateParams.data

  const drizzle = useDrizzle()

  // Find current post
  const currentPost = await drizzle.query.post.findFirst({
    where: eq(tables.post.slug, slug),
  })

  if (!currentPost || !currentPost.publishedAt) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  const currentPublishedAt = currentPost.publishedAt

  // Find previous post (published before current, ordered by publishedAt desc)
  const previousPost = await drizzle.query.post.findFirst({
    where: (post, { and, isNotNull: isNotNullFn, lt: ltFn }) =>
      and(
        isNotNullFn(post.publishedAt),
        ltFn(post.publishedAt, currentPublishedAt),
      ),
    orderBy: desc(tables.post.publishedAt),
  })

  // Find next post (published after current, ordered by publishedAt asc)
  const nextPost = await drizzle.query.post.findFirst({
    where: (post, { and, isNotNull: isNotNullFn, gt: gtFn }) =>
      and(
        isNotNullFn(post.publishedAt),
        gtFn(post.publishedAt, currentPublishedAt),
      ),
    orderBy: asc(tables.post.publishedAt),
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
