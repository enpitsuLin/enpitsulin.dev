import { createAuthClient } from 'better-auth/vue'
import { baseClientOptions } from './auth-options'

export const client = createAuthClient({
  ...baseClientOptions,
})

export const { useSession } = client
