import type { Auth } from 'better-auth'
import type { baseServerOptions } from '~~/shared/auth-options'

export default defineEventHandler((event) => {
  event.context.auth = createAuth()
})

declare module 'h3' {
  interface H3EventContext {
    auth: Auth<typeof baseServerOptions>
  }
}
