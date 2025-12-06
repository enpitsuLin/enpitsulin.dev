import type z from 'zod'
import type { thoughtSchema } from '~~/shared/schema/thought'
import type { Thought, ThoughtInKV } from '~~/shared/types/thought'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import { parseMarkdownForThought } from '../markdown'

export async function insertThought(
  data: z.infer<typeof thoughtSchema>,
): Promise<Thought> {
  const thoughtId = crypto.randomUUID()
  const kvKey = `thought:${thoughtId}`
  const parsed = await parseMarkdownForThought(data.content)

  const drizzle = useDrizzle()

  const publishedAt = new Date()

  // Insert or update thought metadata in database
  await drizzle
    .insert(tables.thoughts)
    .values({
      id: thoughtId,
      mood: data.mood || null,
      publishedAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: tables.thoughts.id,
      set: {
        mood: data.mood || null,
        publishedAt,
        updatedAt: new Date(),
      },
    })

  // Store content and parsed result in KV
  await useKV().set<ThoughtInKV>(kvKey, { content: data.content, parsed })

  return {
    id: thoughtId,
    content: data.content,
    mood: data.mood || null,
    publishedAt,
    updatedAt: new Date(),
    body: parsed.body,
  }
}
