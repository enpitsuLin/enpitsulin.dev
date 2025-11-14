import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { env } from 'cloudflare:workers'
import { defu } from 'defu'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema'
import { baseServerOptions } from './lib/auth/options'

export const auth = betterAuth(defu(
  baseServerOptions,
  {
    database: drizzleAdapter(drizzle(env.DB, { schema }), {
      provider: 'sqlite',
    }),
  },
))

export type Session = typeof auth.$Infer.Session['session']
export type User = typeof auth.$Infer.Session['user']
