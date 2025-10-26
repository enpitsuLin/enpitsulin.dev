import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../database/schema'

export function useDrizzle() {
  return drizzle(env.DB, { schema })
}
