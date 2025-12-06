import { eq } from 'drizzle-orm'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().min(1),
})

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)
  if (!validateParams.success) {
    throw createError({ statusCode: 400, message: validateParams.error.message })
  }
  const { id } = validateParams.data

  const drizzle = useDrizzle()
  const existingThought = await drizzle.query.thoughts.findFirst({
    where: eq(tables.thoughts.id, id),
  })

  if (!existingThought) {
    throw createError({ statusCode: 404, message: 'Thought not found' })
  }

  // Soft delete thought from database
  await drizzle
    .update(tables.thoughts)
    .set({ isDelete: true })
    .where(eq(tables.thoughts.id, id))

  // Delete thought content from KV storage
  const kvKey = `thought:${id}`
  await useKV().remove(kvKey)

  return { success: true, message: 'Thought deleted successfully' }
})
