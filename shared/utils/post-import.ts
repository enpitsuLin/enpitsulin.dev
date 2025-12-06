import type z from 'zod'
import type { postSchema } from '~~/shared/schema/post'
import { parseMarkdown, stringifyMarkdown } from '@nuxtjs/mdc/runtime'

export interface ImportedPostData {
  title?: string
  slug?: string
  description?: string
  tags?: string[]
  publishedAt?: Date
  content: string
}

/**
 * Parse markdown with frontmatter and extract post fields
 */
export async function parseMarkdownWithFrontmatter(
  markdown: string,
): Promise<ImportedPostData> {
  const parsed = await parseMarkdown(markdown)

  // Extract frontmatter from parsed data
  const frontmatter = parsed.data as Record<string, unknown>

  // Extract fields from frontmatter
  const title = typeof frontmatter.title === 'string' ? frontmatter.title : undefined
  const slug = typeof frontmatter.slug === 'string' ? frontmatter.slug : undefined
  const description = typeof frontmatter.description === 'string' ? frontmatter.description : undefined

  // Handle tags - can be array or single string
  let tags: string[] | undefined
  if (frontmatter.tags) {
    if (Array.isArray(frontmatter.tags)) {
      tags = frontmatter.tags.filter((tag): tag is string => typeof tag === 'string')
    }
    else if (typeof frontmatter.tags === 'string') {
      tags = [frontmatter.tags]
    }
  }

  // Handle publishedAt - can be ISO string or Date
  let publishedAt: Date | undefined
  if (frontmatter.publishedAt) {
    if (frontmatter.publishedAt instanceof Date) {
      publishedAt = frontmatter.publishedAt
    }
    else if (typeof frontmatter.publishedAt === 'string') {
      publishedAt = new Date(frontmatter.publishedAt)
    }
  }

  // Get content without frontmatter by stringifying the body AST
  // Pass empty object as frontmatter to get content without frontmatter
  const content = await stringifyMarkdown(parsed.body, {})

  return {
    title,
    slug,
    description,
    tags,
    publishedAt,
    content: content || '',
  }
}

/**
 * Convert imported data to post schema format
 */
export function importedDataToPostSchema(
  imported: ImportedPostData,
): Partial<z.infer<typeof postSchema>> {
  return {
    title: imported.title,
    slug: imported.slug,
    description: imported.description,
    tags: imported.tags,
    publishedAt: imported.publishedAt,
    content: imported.content,
  }
}
