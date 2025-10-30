import type { InsertPost, InsertPostTag, InsertTag } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { defineHandler, getRouterParam, HTTPError, readValidatedBody } from 'h3'
import * as z from 'zod'
import { post, postTag, tag } from '~~/server/database/schema'
import { useDrizzle } from '~~/server/utils/drizzle'

const schema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
})

export default defineHandler(async (event) => {
  event.context.auth.assertAuth('admin')

  const db = useDrizzle()
  const id = getRouterParam(event, 'id')

  const validatedBody = await readValidatedBody(event, schema.safeParse)

  if (validatedBody.error) {
    throw new HTTPError({
      status: 400,
      message: 'Body is required',
    })
  }
  const body = validatedBody.data

  if (!id) {
    throw new HTTPError({
      status: 400,
      message: 'Post ID is required',
    })
  }

  // Check if post exists
  const existingPost = await db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw new HTTPError({
      status: 404,
      message: 'Post not found',
    })
  }

  // Update post
  const updateData: Partial<InsertPost> = {}

  if (body.title !== undefined)
    updateData.title = body.title
  if (body.content !== undefined)
    updateData.content = body.content
  if (body.status !== undefined) {
    updateData.status = body.status
    if (body.status === 'published') {
      updateData.publishedAt = Date.now()
    }
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(post)
      .set(updateData)
      .where(eq(post.id, id))
  }

  // Handle tags if provided
  if (body.tags !== undefined) {
    // Remove existing post-tag relationships
    await db
      .delete(postTag)
      .where(eq(postTag.postId, id))

    // Add new tags if any
    if (body.tags.length > 0) {
      const tagIds: string[] = []

      // Process each tag name
      for (const tagName of body.tags) {
        // Check if tag exists
        const existingTag = await db
          .select({ id: tag.id })
          .from(tag)
          .where(eq(tag.name, tagName))
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
          await db.insert(tag).values(newTag)
        }

        tagIds.push(tagId)
      }

      // Create post-tag relationships
      const postTagRelations: InsertPostTag[] = tagIds.map(tagId => ({
        postId: id,
        tagId,
      }))

      await db.insert(postTag).values(postTagRelations)
    }
  }

  // Return updated post
  const updatedPost = await db
    .select()
    .from(post)
    .where(eq(post.id, id))
    .limit(1)

  return updatedPost[0]
})
