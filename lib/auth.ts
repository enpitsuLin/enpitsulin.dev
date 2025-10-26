import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins/admin'
import { passkey } from 'better-auth/plugins/passkey'
import { useDrizzle } from '~~/server/utils/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(useDrizzle(), {
    provider: 'sqlite',
  }),
  plugins: [
    admin(),
    passkey(),
  ],
})
