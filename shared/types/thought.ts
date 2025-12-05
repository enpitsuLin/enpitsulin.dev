import type { MDCRoot } from '@nuxtjs/mdc'

export interface ParsedThoughtResult {
  body: MDCRoot
}

export interface ThoughtInKV {
  content: string
  parsed: ParsedThoughtResult
}

export interface Thought {
  id: string
  content: string
  mood: string | null
  publishedAt: Date
  updatedAt: Date

  // parsed content
  body: MDCRoot
}
