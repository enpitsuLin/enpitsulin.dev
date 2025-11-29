import z from 'zod'
import { postQuerySchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  const validatedQuery = await getValidatedQuery(event, postQuerySchema.safeParse)

  if (validatedQuery.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedQuery.error),
    })
  }

  const query = validatedQuery.data

  const db = useDrizzle()

  const totalPosts = await db
    .select({ count: count() })
    .from(tables.post)
    .then((result: Array<{ count: number }>) => result[0].count)

  const posts = await db
    .select()
    .from(tables.post)
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
