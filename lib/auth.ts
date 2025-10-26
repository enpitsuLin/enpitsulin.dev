import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { useDrizzle } from '~~/server/utils/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(useDrizzle(), {
    provider: 'sqlite',
  }),
})
