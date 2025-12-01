import z from 'zod'
import { postQuerySchema, postTagParamSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  // Validate route parameters
  const validatedParams = await getValidatedRouterParams(event, postTagParamSchema.safeParse)

  if (validatedParams.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedParams.error),
    })
  }

  // Validate query parameters
  const validatedQuery = await getValidatedQuery(event, postQuerySchema.safeParse)

  if (validatedQuery.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedQuery.error),
    })
  }

  const tagName = decodeURIComponent(validatedParams.data.tag)
  const query = validatedQuery.data

  const db = useDrizzle()

  // Query tag by name
  const tagResult = await db
    .select({ id: tables.tag.id })
    .from(tables.tag)
    .where(eq(tables.tag.name, tagName))
    .limit(1)

  // If tag doesn't exist, return empty result
  if (tagResult.length === 0) {
    return {
      data: [],
      limit: query.limit,
      offset: query.offset ?? 0,
      total: 0,
    }
  }

  const tagId = tagResult[0].id

  // Query postIds through postTag relationship
  const postTags = await db
    .select({ postId: tables.postTag.postId })
    .from(tables.postTag)
    .where(eq(tables.postTag.tagId, tagId))

  const postIds = postTags.map(pt => pt.postId).filter((id): id is string => id !== null)

  // If no posts found, return empty result
  if (postIds.length === 0) {
    return {
      data: [],
      limit: query.limit,
      offset: query.offset ?? 0,
      total: 0,
    }
  }

  // Query total count
  const totalPosts = await db
    .select({ count: count() })
    .from(tables.post)
    .where(inArray(tables.post.id, postIds))
    .then((result: Array<{ count: number }>) => result[0].count)

  // Query posts with pagination
  const posts = await db
    .select()
    .from(tables.post)
    .where(inArray(tables.post.id, postIds))
    .orderBy(desc(tables.post.publishedAt))
    .limit(query.limit)
    .offset(query.offset ?? 0)

  return {
    data: posts,
    limit: query.limit,
    offset: query.offset ?? 0,
    total: totalPosts,
  }
})
