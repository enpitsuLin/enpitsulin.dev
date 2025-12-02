import { parseMarkdown } from '@nuxtjs/mdc/runtime'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { slug } = event.context.params || {}
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' })
  }
  // Force being a string
  const { body } = await readBody(event)
  const parsed = await parseMarkdown(body)

  if (!parsed.data.title) {
    throw createError({ statusCode: 400, message: 'Missing title' })
  }

  await hubKV().set(`post:${slug}`, {
    body,
    parsed,
  })

  return { slug, body, parsed }
})
