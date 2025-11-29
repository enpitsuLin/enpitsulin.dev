import z from 'zod'
import { postSlugParamSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  const validatedParams = await getValidatedRouterParams(event, postSlugParamSchema.safeParse)

  if (validatedParams.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedParams.error),
    })
  }

  const slug = validatedParams.data.slug

  const db = useDrizzle()

  // Query post by slug
  const postResult = await db
    .select()
    .from(tables.post)
    .where(eq(tables.post.slug, slug))
    .limit(1)

  if (postResult.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  const postData = postResult[0]

  // Query previous and next posts
  const previousPost = await db
    .select({
      slug: tables.post.slug,
      title: tables.post.title,
    })
    .from(tables.post)
    .where(lt(tables.post.publishedAt, postData.publishedAt))
    .orderBy(desc(tables.post.publishedAt))
    .limit(1)

  const nextPost = await db
    .select({
      slug: tables.post.slug,
      title: tables.post.title,
    })
    .from(tables.post)
    .where(gt(tables.post.publishedAt, postData.publishedAt))
    .orderBy(asc(tables.post.publishedAt))
    .limit(1)

  return {
    previous: previousPost[0] || null,
    next: nextPost[0] || null,
  }
})
