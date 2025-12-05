import { insertThought } from '~~/server/utils/thought/thought'
import { thoughtSchema } from '~~/shared/schema/thought'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const validateBody = await readValidatedBody(event, thoughtSchema.safeParse)
  if (!validateBody.success) {
    throw createError({ statusCode: 400, message: validateBody.error.message })
  }

  return insertThought(validateBody.data)
})
