import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export const tables = schema

export { and, asc, count, desc, eq, gt, inArray, lt } from 'drizzle-orm'

export function useDrizzle() {
  return drizzle(env.DB, { schema })
}
