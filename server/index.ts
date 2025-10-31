import type { Env } from './middleware/context'
import { zValidator } from '@hono/zod-validator'
import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { auth } from '~~/lib/auth'
import { render } from '~~/src/entry-server'
import * as schema from './database/schema'
import { useDrizzle } from './utils/drizzle'

const apiPostRoute = new Hono<Env>({ strict: false })
  .post(
    '/',
    zValidator(
      'form',
      z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        content: z.string().min(1, 'Content is required'),
        status: z.enum(['draft', 'published', 'archived']).default('draft'),
        tags: z.array(z.string()).default([]),
      }),
    ),
    async (c) => {
      const form = c.req.valid('form')

      const db = useDrizzle()
      // Check if slug already exists
      const existingPost = await db
        .select({ id: schema.post.id })
        .from(schema.post)
        .where(eq(schema.post.slug, form.slug))
        .limit(1)

      if (existingPost.length > 0) {
        throw new HTTPException(409, { message: 'Post with this slug already exists' })
      }

      const postId = crypto.randomUUID()
      const newPost: schema.InsertPost = {
        id: postId,
        title: form.title,
        slug: form.slug,
        content: form.content,
        status: form.status,
      }

      await db.insert(schema.post).values(newPost)

      // Handle tags if provided
      if (form.tags && form.tags.length > 0) {
        const tagIds: string[] = []

        // Process each tag name
        for (const tagName of form.tags) {
          // Check if tag exists
          const existingTag = await db
            .select({ id: schema.tag.id })
            .from(schema.tag)
            .where(eq(schema.tag.name, tagName))
            .limit(1)

          let tagId: string

          if (existingTag.length > 0) {
            tagId = existingTag[0].id
          }
          else {
            // Create new tag
            tagId = crypto.randomUUID()
            const newTag: schema.InsertTag = {
              id: tagId,
              name: tagName,
            }
            await db.insert(schema.tag).values(newTag)
          }

          tagIds.push(tagId)
        }

        // Create post-tag relationships
        const postTagRelations: schema.InsertPostTag[] = tagIds.map(tagId => ({
          postId,
          tagId,
        }))

        if (postTagRelations.length > 0) {
          await db.insert(schema.postTag).values(postTagRelations)
        }
      }

      // Return created post
      const createdPost = await db
        .select()
        .from(schema.post)
        .where(eq(schema.post.id, postId))
        .limit(1)

      return c.json(createdPost[0])
    },
  )
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      }),
    ),
    async (c) => {
      const query = c.req.valid('query')
      const db = useDrizzle()
      const posts = await db
        .select()
        .from(schema.post)
        .limit(query.limit)
        .offset(query.offset)
        .orderBy(desc(schema.post.publishedAt))

      return c.json(posts)
    },
  )
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const param = c.req.valid('param')
      const db = useDrizzle()
      const result = await db
        .select({
          id: schema.post.id,
          title: schema.post.title,
          slug: schema.post.slug,
          content: schema.post.content,
          status: schema.post.status,
          publishedAt: schema.post.publishedAt,
          createdAt: schema.post.createdAt,
          updatedAt: schema.post.updatedAt,
          tagId: schema.tag.id,
          tagName: schema.tag.name,
          tagCreatedAt: schema.tag.createdAt,
          tagUpdatedAt: schema.tag.updatedAt,
        })
        .from(schema.post)
        .leftJoin(schema.postTag, eq(schema.post.id, schema.postTag.postId))
        .leftJoin(schema.tag, eq(schema.postTag.tagId, schema.tag.id))
        .where(eq(schema.post.id, param.id))
        .limit(1)

      if (result.length === 0) {
        throw new HTTPException(404, { message: 'Post not found' })
      }
      const postData = result[0]
      const tags: schema.SelectTag[] = []

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

      const response: schema.SelectPost & { tags: schema.SelectTag[] } = {
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

      return c.json(response)
    },
  )
  .patch(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string(),
      }),
    ),
    zValidator(
      'form',
      z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        tags: z.array(z.string()).optional(),
      }),
    ),
    async (c) => {
      c.get('auth').assertAuth('admin')

      const param = c.req.valid('param')
      const form = c.req.valid('form')

      const db = useDrizzle()

      // Check if post exists
      const existingPost = await db
        .select({ id: schema.post.id })
        .from(schema.post)
        .where(eq(schema.post.id, param.id))
        .limit(1)

      if (existingPost.length === 0) {
        throw new HTTPException(404, { message: 'Post not found' })
      }

      // Update post
      const updateData: Partial<schema.InsertPost> = {}

      if (form.title !== undefined)
        updateData.title = form.title
      if (form.content !== undefined)
        updateData.content = form.content
      if (form.status !== undefined) {
        updateData.status = form.status
        if (form.status === 'published') {
          updateData.publishedAt = Date.now()
        }
      }

      if (Object.keys(updateData).length > 0) {
        await db
          .update(schema.post)
          .set(updateData)
          .where(eq(schema.post.id, param.id))
      }

      // Handle tags if provided
      if (form.tags !== undefined) {
        // Remove existing post-tag relationships
        await db
          .delete(schema.postTag)
          .where(eq(schema.postTag.postId, param.id))

        // Add new tags if any
        if (form.tags && form.tags.length > 0) {
          const tagIds: string[] = []

          // Process each tag name
          for (const tagName of form.tags) {
            // Check if tag exists
            const existingTag = await db
              .select({ id: schema.tag.id })
              .from(schema.tag)
              .where(eq(schema.tag.name, tagName))
              .limit(1)

            let tagId: string

            if (existingTag.length > 0) {
              tagId = existingTag[0].id
            }
            else {
              // Create new tag
              tagId = crypto.randomUUID()
              const newTag: schema.InsertTag = {
                id: tagId,
                name: tagName,
              }
              await db.insert(schema.tag).values(newTag)
            }

            tagIds.push(tagId)
          }

          // Create post-tag relationships
          const postTagRelations: schema.InsertPostTag[] = tagIds.map(tagId => ({
            postId: param.id,
            tagId,
          }))

          await db.insert(schema.postTag).values(postTagRelations)
        }
      }

      // Return updated post
      const updatedPost = await db
        .select()
        .from(schema.post)
        .where(eq(schema.post.id, param.id))
        .limit(1)

      return c.json(updatedPost[0])
    },
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      c.get('auth').assertAuth('admin')

      const param = c.req.valid('param')
      const db = useDrizzle()

      // Check if post exists
      const existingPost = await db
        .select({ id: schema.post.id })
        .from(schema.post)
        .where(eq(schema.post.id, param.id))
        .limit(1)

      if (existingPost.length === 0) {
        throw new HTTPException(404, { message: 'Post not found' })
      }

      // Delete post (cascade will handle postTag relationships)
      await db
        .delete(schema.post)
        .where(eq(schema.post.id, param.id))

      return c.json({ success: true })
    },
  )
  .get('/slug/:slug', zValidator(
    'param',
    z.object({
      slug: z.string(),
    }),
  ), async (c) => {
    const param = c.req.valid('param')
    const db = useDrizzle()
    const result = await db
      .select({
        id: schema.post.id,
        title: schema.post.title,
        slug: schema.post.slug,
        content: schema.post.content,
        status: schema.post.status,
        publishedAt: schema.post.publishedAt,
        createdAt: schema.post.createdAt,
        updatedAt: schema.post.updatedAt,
        tagId: schema.tag.id,
        tagName: schema.tag.name,
        tagCreatedAt: schema.tag.createdAt,
        tagUpdatedAt: schema.tag.updatedAt,
      })
      .from(schema.post)
      .leftJoin(schema.postTag, eq(schema.post.id, schema.postTag.postId))
      .leftJoin(schema.tag, eq(schema.postTag.tagId, schema.tag.id))
      .where(eq(schema.post.slug, param.slug))
      .limit(1)

    if (result.length === 0) {
      throw new HTTPException(404, { message: 'Post not found' })
    }

    const postData = result[0]
    const tags: schema.SelectTag[] = []

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

    const response: schema.SelectPost & { tags: schema.SelectTag[] } = {
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

    return c.json(response)
  })

const apiRoute = new Hono<Env>({ strict: false })
  .on(['POST', 'GET'], '/auth/*', (c) => {
    return auth.handler(c.req.raw)
  })
  .route('/post', apiPostRoute)

const app = new Hono<Env>({ strict: false })
  .use('*', cors())
  .route('/api', apiRoute)
  .get('/*', c => render(c))
  .get('/.well-known/nostr.json', (c) => {
    c.res.headers.set('Content-Type', 'application/json')
    c.res.headers.set('Access-Control-Allow-Origin', '*')
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    c.res.headers.set('Access-Control-Allow-Headers', 'Upgrade, Accept, Content-Type, User-Agent')

    return c.json({
      names: {
        me: '0aadfcac7327642509ec22ecb041d2e5257cda66a4565eb43114639bfe9d2ff0',
      },
      relays: {
      },
    })
  })

export default app

export type AppType = typeof app
