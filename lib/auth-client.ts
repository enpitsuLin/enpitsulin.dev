import { createAuthClient } from 'better-auth/client'
import { baseClientOptions } from './auth-options'

export const client = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL,
  ...baseClientOptions,
})
