import type { BetterAuthClientOptions, BetterAuthOptions } from 'better-auth'
import { adminClient, multiSessionClient, passkeyClient } from 'better-auth/client/plugins'
import { admin } from 'better-auth/plugins/admin'
import { multiSession } from 'better-auth/plugins/multi-session'
import { passkey } from 'better-auth/plugins/passkey'

export const baseServerOptions = {
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  plugins: [
    admin(),
    passkey(),
    multiSession({
      maximumSessions: 5, // 最多允许 5 个并发会话
    }),
  ],
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-real-ip'],
    },
  },
} satisfies BetterAuthOptions

export const baseClientOptions = {
  plugins: [
    adminClient(),
    passkeyClient(),
    multiSessionClient(),
  ],
} satisfies BetterAuthClientOptions
