import type { MDCRoot, Toc } from '@nuxtjs/mdc'

export interface ParsedMDCData {
  estimation: {
    minutes: number
    time: number
    words: number
    chars: number
    text: string
  }
  description: string
}

export interface ParsedPostResult {
  data: ParsedMDCData
  body: MDCRoot
  excerpt: MDCRoot | undefined
  toc: Toc | undefined
}

export interface PostInKV {
  content: string
  parsed: ParsedPostResult
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
  data: ParsedMDCData
}
