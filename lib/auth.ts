import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { env } from 'cloudflare:workers'
import { useDrizzle } from '~~/server/utils/drizzle'
import { baseServerOptions } from './auth-options'

export const auth = betterAuth({
  database: drizzleAdapter(useDrizzle(), {
    provider: 'sqlite',
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
  },
  ...baseServerOptions,
})
