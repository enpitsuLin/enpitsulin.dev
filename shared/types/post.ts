import type { MDCParserResult, MDCRoot, Toc } from '@nuxtjs/mdc'

export interface PostInKV {
  content: string
  parsed: MDCParserResult
}

export interface Post {
  title: string
  slug: string
  content: string
  publishedAt: Date
  description: string | undefined
  updatedAt: Date
  tags: string[]

  // parsed content
  body: MDCRoot
  excerpt: MDCRoot | undefined
  toc: Toc | undefined
  data: MDCParserResult['data']
}
