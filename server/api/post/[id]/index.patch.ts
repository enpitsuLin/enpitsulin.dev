import type { InsertPost, InsertPostTag, InsertTag } from '~~/server/database/schema'
import z from 'zod'
import { postIdParamSchema, postSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  await assertAdmin(event)

  const validatedParams = await getValidatedRouterParams(event, postIdParamSchema.safeParse)

  if (validatedParams.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedParams.error),
    })
  }

  const id = validatedParams.data.id

  const validatedBody = await readValidatedBody(event, postSchema.safeParse)

  if (validatedBody.error) {
    throw createError({
      statusCode: 400,
      statusMessage: validatedBody.error.message,
    })
  }

  const form = validatedBody.data

  const db = useDrizzle()

  // Check if post exists
  const existingPost = await db
    .select({ id: tables.post.id })
    .from(tables.post)
    .where(eq(tables.post.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  // Update post
  const updateData: Partial<InsertPost> = {}

  if (form.title !== undefined)
    updateData.title = form.title
  if (form.content !== undefined)
    updateData.content = form.content
  if (form.slug !== undefined)
    updateData.slug = form.slug
  if (form.status !== undefined) {
    updateData.status = form.status
    if (form.status === 'published') {
      updateData.publishedAt = new Date()
    }
  }
  if (form.excerpt !== undefined)
    updateData.excerpt = form.excerpt
  if (form.publishedAt !== undefined)
    updateData.publishedAt = form.publishedAt
  if (form.updatedAt !== undefined)
    updateData.updatedAt = form.updatedAt

  if (Object.keys(updateData).length > 0) {
    await db
      .update(tables.post)
      .set(updateData)
      .where(eq(tables.post.id, id))
  }

  // Handle tags if provided
  if (form.tags !== undefined) {
    // Remove existing post-tag relationships
    await db
      .delete(tables.postTag)
      .where(eq(tables.postTag.postId, id))

    // Add new tags if any
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
        postId: id,
        tagId,
      }))

      await db.insert(tables.postTag).values(postTagRelations)
    }
  }

  // Return updated post
  const updatedPost = await db
    .select()
    .from(tables.post)
    .where(eq(tables.post.id, id))
    .limit(1)

  return updatedPost[0]
})
