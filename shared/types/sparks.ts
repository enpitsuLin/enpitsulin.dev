export interface SparkMedia {
  id: string
  url: string
  name: string
  kind: 'image' | 'video' | 'audio' | 'file'
  width?: number
  height?: number
}

export interface Spark {
  id: string
  body: MDCRoot
  createdAt: string
  tags: string[]
  media: SparkMedia[]
  url: string
}

export interface SparksPage {
  items: Spark[]
  total: number
  page: number
  hasMore: boolean
  sourceUrl: string
  tag: string
}
import type { MDCRoot } from '@nuxtjs/mdc'
