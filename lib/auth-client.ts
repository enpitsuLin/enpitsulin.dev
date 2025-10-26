import { createAuthClient } from 'better-auth/vue'
import { baseClientOptions } from './auth-options'

export const client = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:3333',
  ...baseClientOptions,
})
