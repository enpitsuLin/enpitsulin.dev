import { z } from 'zod'
import { useDrizzle } from '~~/server/utils/drizzle'

const paramsSchema = z.object({
  slug: z.string().min(1),
})

export default eventHandler(async (event) => {
  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { slug } = validateParams.data

  const dbPost = await useDrizzle().query.post.findFirst({
    where: (post, { and, eq: eqFn, isNotNull: isNotNullFn }) =>
      and(
        eqFn(post.slug, slug),
        isNotNullFn(post.publishedAt),
      ),
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

  const kvKey = `post:${slug}`
  const kvPost = await hubKV().get<PostInKV>(kvKey)

  if (!kvPost) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  return {
    title: dbPost.title,
    slug: dbPost.slug,
    publishedAt: dbPost.publishedAt,
    updatedAt: dbPost.updatedAt,
    content: kvPost.content,
    description: dbPost.description,
    tags: dbPost.postTags.map(pt => pt.tag?.name).filter((name): name is string => name !== undefined),
    ...kvPost.parsed,
  } as Post
})
