import type { Post } from '~~/shared/types/post'
import { db } from 'hub:db'
import { kv } from 'hub:kv'
import { z } from 'zod'
import { exportPostToMarkdown } from '~~/shared/utils/post-export'

const paramsSchema = z.object({
  slug: z.string().min(1),
})

export default eventHandler(async (event) => {
  // Require admin authentication
  await requireUserSession(event)

  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { slug } = validateParams.data

  // Get post from database (no publishedAt check for admin)
  const dbPost = await db.query.post.findFirst({
    where: (post, { eq: eqFn }) => eqFn(post.slug, slug),
    with: {
      postTags: {
        with: {
          tag: true,
        },
      },
    },
  })

  if (!dbPost) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  // Get content from KV
  const kvKey = `post:${slug}`
  const kvPost = await kv.get<PostInKV>(kvKey)

  if (!kvPost) {
    throw createError({ statusCode: 404, message: 'Post content not found' })
  }

  // Combine database fields with KV content to form Post
  const post: Post = {
    title: dbPost.title,
    slug: dbPost.slug,
    publishedAt: dbPost.publishedAt || new Date(),
    updatedAt: dbPost.updatedAt,
    content: kvPost.content,
    description: dbPost.description ?? undefined,
    tags: dbPost.postTags.map(pt => pt.tag?.name).filter((name): name is string => name !== undefined),
    ...kvPost.parsed,
  }

  // Export to markdown
  const markdown = await exportPostToMarkdown(post)

  // Return as text/plain
  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8')
  return markdown
})
