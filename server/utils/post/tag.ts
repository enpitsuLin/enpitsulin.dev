import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export async function insertTags(tags: string[]) {
  return Promise.all(
    tags.map(async (name) => {
      const existing = await db.query.tag.findFirst({
        where: eq(schema.tag.name, name),
      })
      if (existing) {
        return existing.id
      }
      const id = crypto.randomUUID()
      await db.insert(schema.tag).values({ id, name })
      return id
    }),
  )
}
