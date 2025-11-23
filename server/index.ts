import type { Env } from './middleware/context'
import { zValidator } from '@hono/zod-validator'
import { asc, count, desc, eq, gt, inArray, lt } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod/v4'
import { auth } from '~~/lib/auth'
import { render } from '~~/src/entry-server'
import { postSchema } from '~/schemas/post'
import * as schema from './database/schema'
import { middleware } from './middleware/context'
import { useDrizzle } from './utils/drizzle'

const apiPostRoute = new Hono<Env>({ strict: false })
  .post(
    '/',
    zValidator('form', postSchema),
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
        limit: z.coerce.number().int().min(1).max(100).optional().default(10),
        offset: z.coerce.number().int().optional(),
      }),
    ),
    async (c) => {
      const query = c.req.valid('query')
      const db = useDrizzle()

      const totalPosts = await db
        .select({ count: count() })
        .from(schema.post)
        .then(result => result[0].count)

      const posts = await db
        .select()
        .from(schema.post)
        .orderBy(desc(schema.post.publishedAt))
        .limit(query.limit)
        .offset(query.offset ?? 0)

      return c.json({
        data: posts,
        limit: query.limit,
        offset: query.offset ?? 0,
        total: totalPosts,
      })
    },
  )
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const param = c.req.valid('param')
      const db = useDrizzle()

      // Query post
      const postResult = await db
        .select()
        .from(schema.post)
        .where(eq(schema.post.id, param.id))
        .limit(1)

      if (postResult.length === 0) {
        throw new HTTPException(404, { message: 'Post not found' })
      }

      const postData = postResult[0]

      // Query all tags for this post
      const postTags = await db
        .select({
          tagId: schema.postTag.tagId,
        })
        .from(schema.postTag)
        .where(eq(schema.postTag.postId, param.id))

      const tagIds = postTags.map(pt => pt.tagId).filter((id): id is string => id !== null)

      let tags: schema.SelectTag[] = []
      if (tagIds.length > 0) {
        tags = await db
          .select()
          .from(schema.tag)
          .where(inArray(schema.tag.id, tagIds))
      }

      const response: schema.SelectPost & { tags: schema.SelectTag[] } = {
        ...postData,
        tags,
      }

      return c.json(response)
    },
  )
  .patch(
    '/:id',
    zValidator('param', z.object({ id: z.string() })),
    zValidator('form', postSchema),
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
      if (form.slug !== undefined)
        updateData.slug = form.slug
      if (form.status !== undefined) {
        updateData.status = form.status
        if (form.status === 'published') {
          updateData.publishedAt = new Date()
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
    zValidator('param', z.object({ id: z.string() })),
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
  .get(
    '/slug/:slug',
    zValidator('param', z.object({ slug: z.string() })),
    async (c) => {
      const param = c.req.valid('param')
      const db = useDrizzle()

      // Query post by slug
      const postResult = await db
        .select()
        .from(schema.post)
        .where(eq(schema.post.slug, param.slug))
        .limit(1)

      if (postResult.length === 0) {
        throw new HTTPException(404, { message: 'Post not found' })
      }

      const postData = postResult[0]

      // Query all tags for this post
      const postTags = await db
        .select({
          tagId: schema.postTag.tagId,
        })
        .from(schema.postTag)
        .where(eq(schema.postTag.postId, postData.id))

      const tagIds = postTags.map(pt => pt.tagId).filter((id): id is string => id !== null)

      let tags: string[] = []
      if (tagIds.length > 0) {
        tags = await db
          .select({ name: schema.tag.name })
          .from(schema.tag)
          .where(inArray(schema.tag.id, tagIds))
          .then(result => result.map(r => r.name))
      }

      const response: schema.SelectPost & { tags: string[] } = {
        ...postData,
        tags,
      }

      return c.json(response)
    },
  )
  .get(
    '/slug/:slug/surround',
    zValidator('param', z.object({ slug: z.string() })),
    async (c) => {
      const param = c.req.valid('param')
      const db = useDrizzle()

      // Query post by slug
      const postResult = await db
        .select()
        .from(schema.post)
        .where(eq(schema.post.slug, param.slug))
        .limit(1)

      if (postResult.length === 0) {
        throw new HTTPException(404, { message: 'Post not found' })
      }

      const postData = postResult[0]

      // Query previous and next posts
      const previousPost = await db
        .select({
          slug: schema.post.slug,
          title: schema.post.title,
        })
        .from(schema.post)
        .where(lt(schema.post.publishedAt, postData.publishedAt))
        .orderBy(desc(schema.post.publishedAt))
        .limit(1)

      const nextPost = await db
        .select({
          slug: schema.post.slug,
          title: schema.post.title,
        })
        .from(schema.post)
        .where(gt(schema.post.publishedAt, postData.publishedAt))
        .orderBy(asc(schema.post.publishedAt))
        .limit(1)

      return c.json({
        previous: previousPost[0],
        next: nextPost[0],
      })
    },
  )

const apiRoute = new Hono<Env>({ strict: false })
  .on(['POST', 'GET'], '/auth/*', (c) => {
    return auth.handler(c.req.raw)
  })
  .route('/post', apiPostRoute)
  .post('/markdown', zValidator('json', z.object({ markdown: z.string() })), async (c) => {
    const body = c.req.valid('json')
    const { markdown } = body

    try {
      const rendered = await import('~~/server/utils/markdown').then(mod => mod.markdown(markdown))
      return c.json({ rendered })
    }
    catch (error) {
      console.error('Markdown processing error:', error)
      throw new HTTPException(500, { message: 'Markdown processing failed' })
    }
  })

const app = new Hono<Env>({ strict: false })
  .use('*', async (c, next) => {
    if (!import.meta.env.DEV) {
      if (['enpitsulin.dev', 'localhost'].includes(new URL(c.req.url).hostname)) {
        return c.redirect('https://enpitsulin.dev', 301)
      }
    }
    await next()
  })
  .use('*', middleware)
  .use('*', cors())
  .get('/*', (c, next) => {
    if (c.req.path.startsWith('/api')) {
      return next()
    }
    return render(c)
  })
  .route('/api', apiRoute)
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
