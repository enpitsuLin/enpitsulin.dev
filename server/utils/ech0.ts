import type { Spark, SparkMedia, SparksPage } from '#shared/types/sparks'

interface EchoTag {
  id: string
  name: string
}

interface Echo {
  id: string
  content: string
  private: boolean
  created_at: number
  tags?: EchoTag[]
  echo_files?: {
    file_id: string
    sort_order: number
    file?: {
      url: string
      name?: string
      category?: string
      content_type?: string
      width?: number
      height?: number
    }
  }[]
}

const PAGE_SIZE = 20

function publicUrl(value: string, baseUrl: string) {
  try {
    const url = new URL(value, baseUrl)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  }
  catch {
    return undefined
  }
}

function toMedia(files: Echo['echo_files'], baseUrl: string): SparkMedia[] {
  const media: SparkMedia[] = []
  for (const { file_id: id, file } of (files || []).toSorted((a, b) => a.sort_order - b.sort_order)) {
    const url = file?.url && publicUrl(file.url, baseUrl)
    if (!file || !url)
      continue
    const category = file.category || file.content_type?.split('/')[0]
    const kind = category === 'image' || category === 'video' || category === 'audio' ? category : 'file'
    media.push({
      id,
      url,
      name: file.name || '贴文附件',
      kind,
      width: file.width && file.width > 0 ? file.width : undefined,
      height: file.height && file.height > 0 ? file.height : undefined,
    })
  }
  return media
}

function toSpark(echo: Echo, baseUrl: string): Spark {
  return {
    id: echo.id,
    content: echo.content,
    createdAt: new Date(echo.created_at * 1000).toISOString(),
    tags: (echo.tags || []).map(tag => tag.name),
    media: toMedia(echo.echo_files, baseUrl),
    url: new URL(`echo/${encodeURIComponent(echo.id)}`, baseUrl).href,
  }
}

export async function fetchSparks(options: { baseUrl: string, tag: string, page: number, token?: string }): Promise<SparksPage> {
  const baseUrl = `${options.baseUrl.replace(/\/+$/, '')}/`
  const { tag, page } = options
  const token = options.token?.trim()

  const request = $fetch.create({
    baseURL: baseUrl,
    timeout: 8000,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  const { data: tags } = await request<{ data: EchoTag[] }>('api/tags')
  const selectedTag = tags.find(item => item.name === tag)
  const empty: SparksPage = { items: [], total: 0, page, hasMore: false, sourceUrl: baseUrl, tag }
  // An empty tagIds array means ALL posts in Ech0, not an empty result.
  if (!selectedTag?.id)
    return empty

  // Leave private unset to include both public and private posts when authorized.
  const { data } = await request<{ data: { items: Echo[], total: number } }>('api/echo/query', {
    method: 'POST',
    body: {
      page,
      pageSize: PAGE_SIZE,
      tagIds: [selectedTag.id],
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  })
  if (data.items.some(echo => !echo.tags?.some(item => item.id === selectedTag.id)))
    throw new Error('Ech0 returned posts outside the tag filter')

  return {
    ...empty,
    items: data.items.map(echo => toSpark(echo, baseUrl)),
    total: data.total,
    hasMore: data.items.length > 0 && page * PAGE_SIZE < data.total,
  }
}
