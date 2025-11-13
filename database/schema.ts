import { relations, sql } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export * from './auth-schema'

const tags = sqliteTable(
  'tags',
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

const posts = sqliteTable(
  'post',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
    excerpt: text('excerpt'),
    publishedAt: integer('published_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
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

const postsToTags = sqliteTable(
  'posts_to_tags',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  table => [
    // Composite primary key prevents duplicate post-tag combinations
    primaryKey({ columns: [table.postId, table.tagId] }),
  ],
)

const tagRelations = relations(tags, ({ many }) => ({
  postsToTags: many(postsToTags),
}))

const postRelations = relations(posts, ({ many }) => ({
  postsToTags: many(postsToTags),
}))

const postToTagRelations = relations(postsToTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsToTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsToTags.tagId],
    references: [tags.id],
  }),
}))

// Export all tables
export { posts as post, postsToTags, tags as tag }

// Export relations
export { postRelations, postToTagRelations, tagRelations }

// Export types
export type SelectPost = typeof posts.$inferSelect
export type InsertPost = typeof posts.$inferInsert
export type SelectTag = typeof tags.$inferSelect
export type InsertTag = typeof tags.$inferInsert
export type SelectPostTag = typeof postsToTags.$inferSelect
export type InsertPostTag = typeof postsToTags.$inferInsert
