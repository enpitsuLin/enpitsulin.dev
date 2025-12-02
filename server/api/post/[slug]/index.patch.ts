import { z } from 'zod'
import { postSchema } from '~~/shared/schema/post'

const paramsSchema = z.object({
  slug: z.string().min(1),
})

const bodySchema = postSchema.omit({ slug: true })

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { slug } = validateParams.data
  const validateBody = await readValidatedBody(event, bodySchema.safeParse)
  if (!validateBody.success) {
    throw createError({ statusCode: 400, message: validateBody.error.message })
  }

  return insertOrUpdatePost({
    slug,
    ...validateBody.data,
  })
})
