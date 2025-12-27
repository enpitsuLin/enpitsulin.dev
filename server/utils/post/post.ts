import type { InsertPost } from 'hub:db:schema'
import type z from 'zod'
import type { postSchema } from '~~/shared/schema/post'
import type { Post, PostInKV } from '~~/shared/types/post'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { kv } from 'hub:kv'
import { insertTags } from './tag'

export async function insertOrUpdatePost(
  data: z.infer<typeof postSchema>,
): Promise<Omit<Post, 'publishedAt'> & { publishedAt: Date | undefined }> {
  const kvKey = `post:${data.slug}`
  const parsed = await parseMarkdown(data.content)

  if (!data.title) {
    throw createError({ statusCode: 400, message: 'Missing title' })
  }

  const existingPost = await db.query.post.findFirst({
    where: eq(schema.post.slug, data.slug),
  })

  const tags = data.tags || []
  const tagIds = await insertTags(tags)

  if (existingPost) {
    await updatePost(existingPost.id, tagIds, data)
  }
  else {
    await createPost(data, tagIds)
  }

  await kv.set<PostInKV>(kvKey, { content: data.content, parsed })

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
  const [newPost] = await db
    .insert(schema.post)
    .values({
      id: crypto.randomUUID(),
      slug: data.slug,
      title: data.title,
      description: data.description,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    })
    .returning({ id: schema.post.id })

  await syncPostTags(newPost.id, tagIds)
}

async function updatePost(
  postId: string,
  tagIds: string[],
  data: z.infer<typeof postSchema>,
) {
  // Update post metadata
  const updateData: Omit<InsertPost, 'id'> = {
    slug: data.slug,
    title: data.title,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    description: data.description,
  }
  await db
    .update(schema.post)
    .set(updateData)
    .where(eq(schema.post.id, postId))

  // Sync tags (delete old associations and insert new ones)
  await syncPostTags(postId, tagIds)
}

async function syncPostTags(
  postId: string,
  tagIds: string[],
) {
  // Delete all existing tag associations for this post
  await db
    .delete(schema.postTag)
    .where(eq(schema.postTag.postId, postId))

  // Insert new tag associations
  if (tagIds.length > 0) {
    await db.insert(schema.postTag).values(
      tagIds.map(tagId => ({ postId, tagId })),
    )
  }
}
