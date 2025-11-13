import { passkeyClient } from '@better-auth/passkey/client'
import { adminClient, multiSessionClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    passkeyClient(),
    multiSessionClient(),
  ],
})
