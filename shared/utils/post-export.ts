import type { Post } from '~~/shared/types/post'
import { stringifyMarkdown } from '@nuxtjs/mdc/runtime'

/**
 * Export post data to markdown format with frontmatter
 */
export async function exportPostToMarkdown(post: Post): Promise<string> {
  const frontmatter: Record<string, unknown> = {
    title: post.title,
    slug: post.slug,
  }

  if (post.description) {
    frontmatter.description = post.description
  }

  if (post.tags && post.tags.length > 0) {
    frontmatter.tags = post.tags
  }

  if (post.publishedAt) {
    frontmatter.publishedAt = post.publishedAt.toISOString()
  }

  // Use existing AST body from post, no need to re-parse
  const markdown = await stringifyMarkdown(post.body, frontmatter)

  return markdown || ''
}
