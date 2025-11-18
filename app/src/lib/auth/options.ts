import type { BetterAuthOptions } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { admin } from 'better-auth/plugins/admin'
import { multiSession } from 'better-auth/plugins/multi-session'

export const baseServerOptions = {
  emailAndPassword: {
    enabled: true,
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
