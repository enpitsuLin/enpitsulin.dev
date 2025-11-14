'use client'

import { passkeyClient } from '@better-auth/passkey/client'
import { createAuthClient } from 'better-auth/client'
import { adminClient, multiSessionClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    passkeyClient(),
    multiSessionClient(),
  ],
})
