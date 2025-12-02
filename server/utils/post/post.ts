import type z from 'zod'
import type { InsertPost } from '~~/server/database/schema'
import type { postSchema } from '~~/shared/schema/post'
import type { Post, PostInKV } from '~~/shared/types/post'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { eq } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import { insertTags } from './tag'

export async function insertOrUpdatePost(
  data: z.infer<typeof postSchema>,
): Promise<Omit<Post, 'publishedAt'> & { publishedAt: Date | undefined }> {
  const kvKey = `post:${data.slug}`
  const parsed = await parseMarkdown(data.content)

  if (!data.title) {
    throw createError({ statusCode: 400, message: 'Missing title' })
  }

  const drizzle = useDrizzle()
  const existingPost = await drizzle.query.post.findFirst({
    where: eq(tables.post.slug, data.slug),
  })

  const tags = data.tags || []
  const tagIds = await insertTags(tags)

  if (existingPost) {
    await updatePost(existingPost.id, tagIds, data)
  }
  else {
    await createPost(data, tagIds)
  }

  await hubKV().set<PostInKV>(kvKey, { content: data.content, parsed })

  return {
    tags: data.tags || [],
    content: data.content,
    title: data.title,
    slug: data.slug,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    description: data.description,
    updatedAt: new Date(),
    body: parsed.body,
    excerpt: parsed.excerpt,
    toc: parsed.toc,
    data: parsed.data,
  }
}

async function createPost(
  data: z.infer<typeof postSchema>,
  tagIds: string[],
) {
  const drizzle = useDrizzle()

  const [newPost] = await drizzle
    .insert(tables.post)
    .values({
      id: crypto.randomUUID(),
      slug: data.slug,
      title: data.title,
      description: data.description,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    })
    .returning({ id: tables.post.id })

  await syncPostTags(newPost.id, tagIds)
}

async function updatePost(
  postId: string,
  tagIds: string[],
  data: z.infer<typeof postSchema>,
) {
  const drizzle = useDrizzle()

  // Update post metadata
  const updateData: Omit<InsertPost, 'id'> = {
    slug: data.slug,
    title: data.title,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    description: data.description,
  }
  await drizzle
    .update(tables.post)
    .set(updateData)
    .where(eq(tables.post.id, postId))

  // Sync tags (delete old associations and insert new ones)
  await syncPostTags(postId, tagIds)
}

async function syncPostTags(
  postId: string,
  tagIds: string[],
) {
  const drizzle = useDrizzle()

  // Delete all existing tag associations for this post
  await drizzle
    .delete(tables.postTag)
    .where(eq(tables.postTag.postId, postId))

  // Insert new tag associations
  if (tagIds.length > 0) {
    await drizzle.insert(tables.postTag).values(
      tagIds.map(tagId => ({ postId, tagId })),
    )
  }
}
