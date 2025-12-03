import type { ParsedPostResult } from '~~/shared/types/post'
import type { ParsedThoughtResult } from '~~/shared/types/thought'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

export async function parseMarkdownForPost(
  md: string,
): Promise<ParsedPostResult> {
  const result = await parseMarkdown(md)
  return result as ParsedPostResult
}

export async function parseMarkdownForThought(
  md: string,
): Promise<ParsedThoughtResult> {
  const result = await parseMarkdown(md)
  return result as ParsedThoughtResult
}
