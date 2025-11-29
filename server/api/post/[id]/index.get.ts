import type { SelectPost, SelectTag } from '~~/server/database/schema'
import z from 'zod'
import { postIdParamSchema } from '~~/shared/schema/post'

export default defineEventHandler(async (event) => {
  const validatedParams = await getValidatedRouterParams(event, postIdParamSchema.safeParse)

  if (validatedParams.error) {
    throw createError({
      statusCode: 400,
      statusMessage: z.prettifyError(validatedParams.error),
    })
  }

  const id = validatedParams.data.id

  const db = useDrizzle()

  // Query post
  const postResult = await db
    .select()
    .from(tables.post)
    .where(eq(tables.post.id, id))
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
    .where(eq(tables.postTag.postId, id))

  const tagIds = postTags.map(pt => pt.tagId).filter((id): id is string => id !== null)

  let tags: SelectTag[] = []
  if (tagIds.length > 0) {
    tags = await db
      .select()
      .from(tables.tag)
      .where(inArray(tables.tag.id, tagIds))
  }

  const response: SelectPost & { tags: SelectTag[] } = {
    ...postData,
    tags,
  }

  return response
})
