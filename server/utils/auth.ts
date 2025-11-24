import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { env } from 'cloudflare:workers'
import { createMimeMessage } from 'mimetext/browser'
import { baseServerOptions } from '~~/shared/auth-options'
import { useDrizzle } from './drizzle'

const senderEmail = 'sender@enpitsulin.dev'

export const auth = betterAuth({
  trustedOrigins: (import.meta.dev) ? ['*'] : ['https://enpitsulin.dev', '*.enpitsulin.workers.dev'],
  database: drizzleAdapter(useDrizzle(), {
    provider: 'sqlite',
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url, token }) {
      const { EmailMessage } = await import('cloudflare:email')
      const msg = createMimeMessage()
      msg.setSender({ name: 'Sending email test', addr: senderEmail })
      msg.setRecipient(user.email)
      msg.setSubject('enpitsulin.dev 邮箱验证邮件')
      msg.addMessage({
        contentType: 'text/plain',
        data: `点击链接验证邮箱: ${url} ${token}`,
      })

      const message = new EmailMessage(senderEmail, user.email, msg.asRaw())
      await env.SEB.send(message)
    },
  },

  ...baseServerOptions,
})

export type User = typeof auth['$Infer']['Session']['user']
export type Session = typeof auth['$Infer']['Session']['session']
