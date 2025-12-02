import type { MDCData, MDCParserResult } from '@nuxtjs/mdc'

export interface ParsedPost {
  body: string
  parsed: Omit<MDCParserResult, 'data'> & {
    data: Pick<MDCData, 'title' | 'description' | 'estimation'> & {
      publishedAt: string
      tags: string[]
      createdAt: string
      updatedAt: string
    }
  }
}

export default eventHandler(async (event) => {
  const { slug } = event.context.params || {}
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' })
  }

  const note = await hubKV().get<ParsedPost>(`post:${slug}`)

  if (!note) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  return { slug, ...note }
})
