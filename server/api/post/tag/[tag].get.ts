import type { Post } from '~~/shared/types/post'
import { and, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { kv } from 'hub:kv'

export default eventHandler(async (event) => {
  const tagName = getRouterParam(event, 'tag')
  if (!tagName) {
    throw createError({ statusCode: 400, message: 'Tag name is required' })
  }

  const query = getQuery(event)
  const limit = query.limit ? Number.parseInt(query.limit as string) : 10
  const offset = query.offset ? Number.parseInt(query.offset as string) : 0

  // Find tag by name
  const tag = await db.query.tag.findFirst({
    where: eq(schema.tag.name, decodeURIComponent(tagName)),
  })

  if (!tag) {
    return {
      data: [] as Post[],
      total: 0,
      limit,
      offset,
    }
  }

  // Get all post IDs that have this tag
  const postTags = await db.query.postTag.findMany({
    where: eq(schema.postTag.tagId, tag.id),
    columns: {
      postId: true,
    },
  })

  const postIds = postTags.map(pt => pt.postId).filter((id): id is string => id !== null)

  if (postIds.length === 0) {
    return {
      data: [] as Post[],
      total: 0,
      limit,
      offset,
    }
  }

  // Query posts from database with pagination
  const dbPosts = await db.query.post.findMany({
    where: and(
      inArray(schema.post.id, postIds),
      isNotNull(schema.post.publishedAt),
      eq(schema.post.isDelete, false),
    ),
    orderBy: desc(schema.post.publishedAt),
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
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.post)
    .where(
      and(
        inArray(schema.post.id, postIds),
        isNotNull(schema.post.publishedAt),
        eq(schema.post.isDelete, false),
      ),
    )

  const total = totalResult[0]?.count ?? 0

  // Fetch parsed content from KV for each post
  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const kvKey = `post:${dbPost.slug}`
      const kvPost = await kv.get<PostInKV>(kvKey)

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
