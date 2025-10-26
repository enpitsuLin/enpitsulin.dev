import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins/admin'
import { passkey } from 'better-auth/plugins/passkey'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { useDrizzle } from '~~/server/utils/drizzle'

const dummyDb = drizzle(async () => {
  return { rows: [] }
})

export const auth = betterAuth({
  database: drizzleAdapter(import.meta.env.SSR ? useDrizzle() : dummyDb, {
    provider: 'sqlite',
  }),
  plugins: [
    admin(),
    passkey(),
  ],
})
