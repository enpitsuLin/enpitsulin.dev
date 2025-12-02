import type { SelectPost } from '~~/server/database/schema'
import type { Post } from '~~/shared/types/post'
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

export default eventHandler(async (event) => {
  const tagName = getRouterParam(event, 'tag')
  if (!tagName) {
    throw createError({ statusCode: 400, message: 'Tag name is required' })
  }

  const query = getQuery(event)
  const limit = query.limit ? Number.parseInt(query.limit as string) : 10
  const offset = query.offset ? Number.parseInt(query.offset as string) : 0

  const drizzle = useDrizzle()

  // Find tag by name
  const tag = await drizzle.query.tag.findFirst({
    where: eq(tables.tag.name, decodeURIComponent(tagName)),
  })

  if (!tag) {
    return {
      data: [] as Post[],
      total: 0,
      limit,
      offset,
    }
  }

  // Query posts that have this tag and are published
  const dbPosts = await drizzle
    .select({
      id: tables.post.id,
      slug: tables.post.slug,
      title: tables.post.title,
      createdAt: tables.post.createdAt,
      updatedAt: tables.post.updatedAt,
      publishedAt: tables.post.publishedAt,
    })
    .from(tables.post)
    .innerJoin(tables.postTag, eq(tables.post.id, tables.postTag.postId))
    .where(
      and(
        eq(tables.postTag.tagId, tag.id),
        isNotNull(tables.post.publishedAt),
      ),
    )
    .orderBy(desc(tables.post.publishedAt))
    .limit(limit)
    .offset(offset)

  // Get total count for pagination
  const totalResult = await drizzle
    .select({ count: sql<number>`count(*)` })
    .from(tables.post)
    .innerJoin(tables.postTag, eq(tables.post.id, tables.postTag.postId))
    .where(
      and(
        eq(tables.postTag.tagId, tag.id),
        isNotNull(tables.post.publishedAt),
      ),
    )

  const total = totalResult[0]?.count ?? 0

  // Fetch parsed content from KV for each post
  const posts = await Promise.all(
    dbPosts.map(async (dbPost: SelectPost) => {
      const kvKey = `post:${dbPost.slug}`
      const kvPost = await hubKV().get<PostInKV>(kvKey)

      if (!kvPost) {
        // Skip posts that don't exist in KV
        return null
      }

      // Combine database fields with KV content
      return {
        slug: dbPost.slug,
        publishedAt: dbPost.publishedAt,
        updatedAt: dbPost.updatedAt,
        ...kvPost.parsed,
      }
    }),
  )

  const validPosts = posts.filter((post): post is Post => post !== null)

  return {
    data: validPosts,
    total,
    limit,
    offset,
  }
})
