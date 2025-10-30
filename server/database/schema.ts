import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export * from './auth-schema'

const tag = sqliteTable(
  'tag',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [
    index('tag_name_idx').on(table.name),
  ],
)

const post = sqliteTable(
  'post',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
    publishedAt: integer('published_at'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  table => [
    index('post_slug_idx').on(table.slug),
    index('post_status_idx').on(table.status),
    index('post_published_at_idx').on(table.publishedAt),
    index('post_created_at_idx').on(table.createdAt),
  ],
)

const postTag = sqliteTable(
  'post_tag',
  {
    postId: text('post_id').references(() => post.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').references(() => tag.id, { onDelete: 'cascade' }),
  },
  table => [index('post_tag_idx').on(table.postId, table.tagId)],
)

// Export all tables
export { post, postTag, tag }

// Export types
export type SelectPost = typeof post.$inferSelect
export type InsertPost = typeof post.$inferInsert
export type SelectTag = typeof tag.$inferSelect
export type InsertTag = typeof tag.$inferInsert
export type SelectPostTag = typeof postTag.$inferSelect
export type InsertPostTag = typeof postTag.$inferInsert
