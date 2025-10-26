import { createAuthClient } from 'better-auth/client'
import { adminClient, passkeyClient } from 'better-auth/client/plugins'

export const client = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL,
  plugins: [
    adminClient(),
    passkeyClient(),
  ],
})
