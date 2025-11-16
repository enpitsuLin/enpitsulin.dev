'use server'

import type { SQL } from 'drizzle-orm'
import { posts } from '@database/schema'
import { eq } from 'drizzle-orm'
import { db } from '../drizzle'

interface GetPostQuery {
  slug?: string
  id?: string
}

export async function getPost(query: GetPostQuery) {
  let where: SQL<unknown>
  if (!query.slug && !query.id) {
    throw new Error('Should have slug or id to query post')
  }
  if (query.slug) {
    where = eq(posts.slug, query.slug!)
  }
  else {
    where = eq(posts.id, query.id!)
  }

  const postWithTags = await db.query.posts.findFirst({
    where,
    with: {
      postsToTags: {
        columns: {},
        with: {
          tag: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  })
  if (postWithTags) {
    const { postsToTags, ...post } = postWithTags
    return {
      ...post,
      tags: postsToTags.map(r => r.tag.name),
    }
  }
  return null
}

export async function getPosts(config: Parameters<typeof db.query.posts.findMany>[0]) {
  const postsWithTags = await db.query.posts.findMany({
    ...config,
    with: {
      postsToTags: {
        columns: {},
        with: {
          tag: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  })

  return postsWithTags.map(({ postsToTags, ...post }) => {
    return {
      ...post,
      tags: postsToTags.map(r => r.tag.name),
    }
  })
}

export type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>
