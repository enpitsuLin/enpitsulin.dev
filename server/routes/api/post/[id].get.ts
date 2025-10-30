import type { SelectPost, SelectTag } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { defineHandler, getRouterParam, HTTPError } from 'h3'
import { post, postTag, tag } from '../../../database/schema'
import { useDrizzle } from '../../../utils/drizzle'

export default defineHandler(async (event) => {
  const db = useDrizzle()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw new HTTPError({
      status: 400,
      message: 'Post ID is required',
    })
  }

  // Get post with tags
  const result = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tagId: tag.id,
      tagName: tag.name,
      tagCreatedAt: tag.createdAt,
      tagUpdatedAt: tag.updatedAt,
    })
    .from(post)
    .leftJoin(postTag, eq(post.id, postTag.postId))
    .leftJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(post.id, id))
    .limit(1)

  if (result.length === 0) {
    throw new HTTPError({
      status: 404,
      message: 'Post not found',
    })
  }

  const postData = result[0]
  const tags: SelectTag[] = []

  // Group tags
  for (const row of result) {
    if (row.tagId && !tags.find(t => t.id === row.tagId)) {
      tags.push({
        id: row.tagId!,
        name: row.tagName!,
        createdAt: row.tagCreatedAt!,
        updatedAt: row.tagUpdatedAt!,
      })
    }
  }

  const response: SelectPost & { tags: SelectTag[] } = {
    id: postData.id,
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    status: postData.status,
    publishedAt: postData.publishedAt,
    createdAt: postData.createdAt,
    updatedAt: postData.updatedAt,
    tags,
  }

  return response
})
