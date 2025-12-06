import { and, desc, eq, lt } from 'drizzle-orm'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const limit = query.limit ? Number.parseInt(query.limit as string) : 10
  const cursor = query.cursor ? Number.parseInt(query.cursor as string) : null

  const drizzle = useDrizzle()

  // Build where condition for cursor-based pagination
  const whereConditions = cursor
    ? and(
        eq(tables.thoughts.isDelete, false),
        lt(tables.thoughts.publishedAt, new Date(cursor * 1000)),
      )
    : eq(tables.thoughts.isDelete, false)

  // Query thoughts from database with cursor-based pagination
  const dbThoughts = await drizzle.query.thoughts.findMany({
    where: whereConditions,
    orderBy: desc(tables.thoughts.publishedAt),
    limit: limit + 1, // Fetch one extra to check if there's more
  })

  // Check if there's more data
  const hasMore = dbThoughts.length > limit
  const thoughtsToProcess = hasMore ? dbThoughts.slice(0, limit) : dbThoughts

  // Fetch parsed content from KV for each thought
  const thoughts = await Promise.all(
    thoughtsToProcess.map(async (dbThought) => {
      const kvKey = `thought:${dbThought.id}`
      const kvThought = await useKV().get<ThoughtInKV>(kvKey)

      if (!kvThought) {
        // Skip thoughts that don't exist in KV
        return null
      }

      // Combine database fields with KV content
      return {
        id: dbThought.id,
        mood: dbThought.mood,
        publishedAt: dbThought.publishedAt,
        updatedAt: dbThought.updatedAt,
        content: kvThought.content,
        body: kvThought.parsed.body,
      } as Thought
    }),
  )

  const validThoughts = thoughts.filter((thought): thought is Thought => thought !== null)

  // Calculate next cursor based on the last database item processed, not the last valid thought
  // This ensures pagination continues correctly even if some KV lookups fail
  const nextCursor = hasMore && dbThoughts.length > limit
    ? Math.floor(dbThoughts[limit].publishedAt.getTime() / 1000)
    : null

  return {
    data: validThoughts,
    nextCursor,
    limit,
  }
})
