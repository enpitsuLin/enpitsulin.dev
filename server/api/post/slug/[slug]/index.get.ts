import type { SelectPost } from '~~/server/database/schema'
import z from 'zod'
import { postSlugParamSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  const validatedParams = await getValidatedRouterParams(event, postSlugParamSchema.safeParse)

  if (validatedParams.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedParams.error),
    })
  }

  const slug = validatedParams.data.slug

  const db = useDrizzle()

  // Query post by slug
  const postResult = await db
    .select()
    .from(tables.post)
    .where(eq(tables.post.slug, slug))
    .limit(1)

  if (postResult.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  const postData = postResult[0]

  // Query all tags for this post
  const postTags = await db
    .select({
      tagId: tables.postTag.tagId,
    })
    .from(tables.postTag)
    .where(eq(tables.postTag.postId, postData.id))

  const tagIds = postTags.map(pt => pt.tagId).filter((id): id is string => id !== null)

  let tags: string[] = []
  if (tagIds.length > 0) {
    tags = await db
      .select({ name: tables.tag.name })
      .from(tables.tag)
      .where(inArray(tables.tag.id, tagIds))
      .then(result => result.map(r => r.name))
  }

  const response: SelectPost & { tags: string[] } = {
    ...postData,
    tags,
  }

  return response
})
