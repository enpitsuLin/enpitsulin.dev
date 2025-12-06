import { z } from 'zod'
import { insertOrUpdatePost } from '~~/server/utils/post/post'
import { parseMarkdownWithFrontmatter } from '~~/shared/utils/post-import'

const importSchema = z.object({
  markdown: z.string().min(1),
})

export default eventHandler(async (event) => {
  await requireUserSession(event)

  const validateBody = await readValidatedBody(event, importSchema.safeParse)
  if (!validateBody.success) {
    throw createError({ statusCode: 400, message: validateBody.error.message })
  }

  const { markdown } = validateBody.data

  // Parse markdown with frontmatter
  const imported = await parseMarkdownWithFrontmatter(markdown)

  // Validate required fields
  if (!imported.title) {
    throw createError({ statusCode: 400, message: 'Missing title in frontmatter' })
  }

  if (!imported.slug) {
    throw createError({ statusCode: 400, message: 'Missing slug in frontmatter' })
  }

  // Convert to post schema format
  const postData = {
    title: imported.title,
    slug: imported.slug,
    content: imported.content,
    description: imported.description,
    tags: imported.tags || [],
    publishedAt: imported.publishedAt,
  }

  // Create or update post
  return insertOrUpdatePost(postData)
})
