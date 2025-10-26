import { drizzle } from 'drizzle-orm/sqlite-proxy'
import * as schema from '../database/schema'

export function useDrizzle() {
  return drizzle(
    async () => {
      return { rows: [] }
    },
    { schema },
  )
}
