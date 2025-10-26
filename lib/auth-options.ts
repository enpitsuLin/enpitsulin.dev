import type { BetterAuthClientOptions, BetterAuthOptions } from 'better-auth'
import { adminClient, passkeyClient } from 'better-auth/client/plugins'
import { admin } from 'better-auth/plugins/admin'
import { passkey } from 'better-auth/plugins/passkey'

export const baseServerOptions = {
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    passkey(),
  ],
} satisfies BetterAuthOptions

export const baseClientOptions = {
  plugins: [
    adminClient(),
    passkeyClient(),
  ],
} satisfies BetterAuthClientOptions
