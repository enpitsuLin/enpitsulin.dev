import { eq } from 'drizzle-orm'

export async function insertTags(tags: string[]) {
  const drizzle = useDrizzle()

  return Promise.all(
    tags.map(async (name) => {
      const existing = await drizzle.query.tag.findFirst({
        where: eq(tables.tag.name, name),
      })
      if (existing) {
        return existing.id
      }
      const id = crypto.randomUUID()
      await drizzle.insert(tables.tag).values({ id, name })
      return id
    }),
  )
}
