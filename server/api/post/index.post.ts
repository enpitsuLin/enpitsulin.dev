import type { InsertPost, InsertPostTag, InsertTag } from '~~/server/database/schema'
import z from 'zod'
import { postSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  const validateBody = await readValidatedBody(event, postSchema.safeParse)

  if (validateBody.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validateBody.error),
    })
  }

  const form = validateBody.data

  const db = useDrizzle()

  // Check if slug already exists
  const existingPost = await db
    .select({ id: tables.post.id })
    .from(tables.post)
    .where(eq(tables.post.slug, form.slug))
    .limit(1)

  if (existingPost.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Post with this slug already exists',
    })
  }

  const postId = crypto.randomUUID()
  const newPost: InsertPost = {
    id: postId,
    title: form.title,
    slug: form.slug,
    content: form.content,
    status: form.status,
    updatedAt: form.updatedAt,
    createdAt: form.createdAt,
    publishedAt: form.publishedAt,
    excerpt: form.excerpt,
  }

  await db.insert(tables.post).values(newPost)

  // Handle tags if provided
  if (form.tags && form.tags.length > 0) {
    const tagIds: string[] = []

    // Process each tag name
    for (const tagName of form.tags) {
      // Check if tag exists
      const existingTag = await db
        .select({ id: tables.tag.id })
        .from(tables.tag)
        .where(eq(tables.tag.name, tagName))
        .limit(1)

      let tagId: string

      if (existingTag.length > 0) {
        tagId = existingTag[0].id
      }
      else {
        // Create new tag
        tagId = crypto.randomUUID()
        const newTag: InsertTag = {
          id: tagId,
          name: tagName,
        }
        await db.insert(tables.tag).values(newTag)
      }

      tagIds.push(tagId)
    }

    // Create post-tag relationships
    const postTagRelations: InsertPostTag[] = tagIds.map(tagId => ({
      postId,
      tagId,
    }))

    if (postTagRelations.length > 0) {
      await db.insert(tables.postTag).values(postTagRelations)
    }
  }

  // Return created post
  const createdPost = await db
    .select()
    .from(tables.post)
    .where(eq(tables.post.id, postId))
    .limit(1)

  return createdPost[0]
})
