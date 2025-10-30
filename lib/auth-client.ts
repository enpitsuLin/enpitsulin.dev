import type { BetterAuthClientOptions } from 'better-auth'
import { createAuthClient } from 'better-auth/vue'
import { baseClientOptions } from './auth-options'

export type Client = ReturnType<typeof createBaseAuthClient>

export function createBaseAuthClient(options?: BetterAuthClientOptions) {
  return createAuthClient({
    ...options,
    ...baseClientOptions,
  })
}
