import type { InsertPost, InsertPostTag, InsertTag } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'
import { defineHandler, HTTPError, readValidatedBody } from 'h3'
import * as z from 'zod'
import { post, postTag, tag } from '~~/server/database/schema'
import { useDrizzle } from '~~/server/utils/drizzle'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string()).default([]),
})

export default defineHandler(async (event) => {
  event.context.auth.assertAuth('admin')

  const db = useDrizzle()

  const validatedBody = await readValidatedBody(event, schema.safeParse)
  if (validatedBody.error) {
    throw new HTTPError({
      status: 400,
      message: 'Body is required',
    })
  }

  const body = validatedBody.data

  // Validate required fields
  if (!body.title || !body.slug || !body.content) {
    throw new HTTPError({
      status: 400,
      message: 'Title, slug, and content are required',
    })
  }

  // Check if slug already exists
  const existingPost = await db
    .select({ id: post.id })
    .from(post)
    .where(eq(post.slug, body.slug))
    .limit(1)

  if (existingPost.length > 0) {
    throw new HTTPError({
      status: 409,
      message: 'Post with this slug already exists',
    })
  }

  // Create post
  const postId = crypto.randomUUID()
  const newPost: InsertPost = {
    id: postId,
    title: body.title,
    slug: body.slug,
    content: body.content,
    status: body.status,
  }

  await db.insert(post).values(newPost)

  // Handle tags if provided
  if (body.tags && body.tags.length > 0) {
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
      postId,
      tagId,
    }))

    if (postTagRelations.length > 0) {
      await db.insert(postTag).values(postTagRelations)
    }
  }

  // Return created post
  const createdPost = await db
    .select()
    .from(post)
    .where(eq(post.id, postId))
    .limit(1)

  return createdPost[0]
})
