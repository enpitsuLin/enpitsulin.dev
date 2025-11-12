import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [],
})

export type Session = typeof auth.$Infer.Session
