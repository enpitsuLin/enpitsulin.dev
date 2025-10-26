import type { BetterAuthClientOptions, BetterAuthOptions } from 'better-auth'
import { adminClient, multiSessionClient, passkeyClient } from 'better-auth/client/plugins'
import { admin } from 'better-auth/plugins/admin'
import { multiSession } from 'better-auth/plugins/multi-session'
import { passkey } from 'better-auth/plugins/passkey'

export const baseServerOptions = {
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      // eslint-disable-next-line no-console
      console.log('发送邮件验证:', { user, url, token })
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url, token }) => {
        // TODO: 实现发送邮件验证逻辑
        // eslint-disable-next-line no-console
        console.log('发送邮件验证:', { user, newEmail, url, token })
      },
    },
  },
  plugins: [
    admin(),
    passkey(),
    multiSession({
      maximumSessions: 5, // 最多允许 5 个并发会话
    }),
  ],
} satisfies BetterAuthOptions

export const baseClientOptions = {
  plugins: [
    adminClient(),
    passkeyClient(),
    multiSessionClient(),
  ],
} satisfies BetterAuthClientOptions
