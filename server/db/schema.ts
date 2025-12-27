import { relations, sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// MARK: - Tables

export const post = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`)
      .$onUpdate(() => new Date())
      .notNull(),
    publishedAt: integer('published_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`),
    isDelete: integer('is_delete', { mode: 'boolean' }).default(false).notNull(),
  },
  table => [
    index('post_slug_idx').on(table.slug),
    index('post_published_at_idx').on(table.publishedAt),
  ],
)

export const tag = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => [
    index('idx_name').on(table.name),
  ],
)

export const postTag = sqliteTable(
  'post_tag',
  {
    postId: text('post_id').references(() => post.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').references(() => tag.id, { onDelete: 'cascade' }),
  },
  table => [
    index('post_tag_idx').on(table.postId, table.tagId),
  ],
)

export const thoughts = sqliteTable(
  'thoughts',
  {
    id: text('id').primaryKey(),
    mood: text('mood'),
    publishedAt: integer('published_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(unixepoch('now'))`)
      .$onUpdate(() => new Date())
      .notNull(),
    isDelete: integer('is_delete', { mode: 'boolean' }).default(false).notNull(),
  },
  table => [
    index('thoughts_published_at_idx').on(table.publishedAt),
  ],
)

// MARK: - Relations
export const postRelations = relations(post, ({ many }) => ({
  postTags: many(postTag),
}))

export const tagRelations = relations(tag, ({ many }) => ({
  postTags: many(postTag),
}))

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}))

export type SelectPost = typeof post.$inferSelect
export type InsertPost = typeof post.$inferInsert
export type SelectTag = typeof tag.$inferSelect
export type InsertTag = typeof tag.$inferInsert
export type SelectPostTag = typeof postTag.$inferSelect
export type InsertPostTag = typeof postTag.$inferInsert
export type SelectThought = typeof thoughts.$inferSelect
export type InsertThought = typeof thoughts.$inferInsert
