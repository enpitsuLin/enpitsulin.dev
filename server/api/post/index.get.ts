import type { Post } from '~~/shared/types/post'
import { and, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const limit = query.limit ? Number.parseInt(query.limit as string) : 10
  const offset = query.offset ? Number.parseInt(query.offset as string) : 0

  const drizzle = useDrizzle()

  // Query posts from database with pagination
  const dbPosts = await drizzle.query.post.findMany({
    where: and(
      isNotNull(tables.post.publishedAt),
      eq(tables.post.isDelete, false),
    ),
    orderBy: desc(tables.post.publishedAt),
    limit,
    offset,
    with: {
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  // Get total count for pagination
  const totalResult = await drizzle
    .select({ count: sql<number>`count(*)` })
    .from(tables.post)
    .where(
      and(
        isNotNull(tables.post.publishedAt),
        eq(tables.post.isDelete, false),
      ),
    )

  const total = totalResult[0]?.count ?? 0

  // Fetch parsed content from KV for each post
  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const kvKey = `post:${dbPost.slug}`
      const kvPost = await hubKV().get<PostInKV>(kvKey)

      if (!kvPost) {
        // Skip posts that don't exist in KV
        return null
      }

      // Combine database fields with KV content
      return {
        id: dbPost.id,
        title: dbPost.title,
        slug: dbPost.slug,
        description: dbPost.description,
        publishedAt: dbPost.publishedAt,
        updatedAt: dbPost.updatedAt,
        content: kvPost.content,
        tags: dbPost.postTags.map(pt => pt.tag?.name).filter((name): name is string => name !== undefined),
        ...kvPost.parsed,
      } as Post
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
