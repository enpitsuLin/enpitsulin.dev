import type { SQL } from 'drizzle-orm'
import type { SelectPost } from '~~/server/database/schema'
import type { PaginatedResponse } from '~~/server/utils/pagination'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { defineHandler, getQuery } from 'h3'
import { post, postTag, tag } from '~~/server/database/schema'
import { parsePagination } from '~~/server/utils/pagination'
import { useDrizzle } from '../../../utils/drizzle'

export default defineHandler(async (event) => {
  const db = useDrizzle()
  const query = getQuery(event)

  // Parse pagination
  const { page, pageSize, limit, offset } = parsePagination(query)

  // Parse filters
  const status = query.status as string
  const tagFilter = query.tag as string
  const searchQuery = query.q as string
  const sortField = query.sort as string || '-publishedAt'

  // Build where conditions
  const conditions: SQL[] = []

  if (status) {
    conditions.push(eq(post.status, status as any))
  }

  if (searchQuery) {
    conditions.push(
      sql`(${post.title} LIKE ${`%${searchQuery}%`} OR ${post.content} LIKE ${`%${searchQuery}%`})`,
    )
  }

  // Build sort
  const [sortFieldName, sortDirection] = sortField.startsWith('-')
    ? [sortField.slice(1), 'desc']
    : [sortField, 'asc']

  const sortColumn = sortFieldName === 'publishedAt'
    ? post.publishedAt
    : sortFieldName === 'createdAt'
      ? post.createdAt
      : sortFieldName === 'updatedAt'
        ? post.updatedAt
        : post.publishedAt

  const orderBy = sortDirection === 'desc' ? desc(sortColumn) : asc(sortColumn)

  // Build query
  let queryBuilder

  if (tagFilter) {
    // If filtering by tag, join with postTag and tag tables
    queryBuilder = db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
      .from(post)
      .leftJoin(postTag, eq(post.id, postTag.postId))
      .leftJoin(tag, eq(postTag.tagId, tag.id))
      .where(and(...conditions, eq(tag.name, tagFilter)))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
  }
  else {
    // Regular query without tag filtering
    queryBuilder = db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
      .from(post)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
  }

  const [items, totalResult] = await Promise.all([
    queryBuilder,
    db.select({ count: sql<number>`count(*)` })
      .from(post)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ])

  const total = totalResult[0]?.count || 0

  const response: PaginatedResponse<SelectPost> = {
    items: items as SelectPost[],
    total,
    page,
    pageSize,
  }

  return response
})
