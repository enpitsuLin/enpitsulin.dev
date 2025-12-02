import { postSchema } from '~~/shared/schema/post'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const validateBody = await readValidatedBody(event, postSchema.safeParse)
  if (!validateBody.success) {
    throw createError({ statusCode: 400, message: validateBody.error.message })
  }

  return insertOrUpdatePost(validateBody.data)
})
