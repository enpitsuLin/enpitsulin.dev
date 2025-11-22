import type { Session, User } from '~~/lib/auth'
import type { Client } from '~~/lib/auth/client'
import { defineZootPlugin } from '~~/lib/app'
import { createBaseAuthClient } from '~~/lib/auth/client'

export interface Auth {
  session: ShallowRef<Session | null>
  user: ShallowRef<User | null>
  client: Client
  refreshSession: () => Promise<void>
}

export default defineZootPlugin(async (zootApp) => {
  const initialURL = !import.meta.env.SSR
    ? globalThis.location.href
    : zootApp.ssrContext!.url

  const headers = import.meta.env.SSR ? zootApp.ssrContext!.context.req.header() : undefined

  const user = shallowRef<User | null>(null)
  const session = shallowRef<Session | null>(null)
  const baseURL = new URL(initialURL).origin
  const client = createBaseAuthClient({
    baseURL,
    fetchOptions: {
      headers,
    },
  })

  const isFetchingSession = ref(false)
  const auth = {
    client,
    session,
    user,
    refreshSession: async () => {
      if (isFetchingSession.value)
        return
      isFetchingSession.value = true
      const res = await auth.client.getSession()
      if (res.error) {
        return
      }
      auth.session.value = res.data?.session ?? null
      auth.user.value = res.data?.user ?? null
      isFetchingSession.value = false

      return {
        session: auth.session.value,
        user: auth.user.value,
      }
    },
  }

  if (!import.meta.env.SSR) {
    auth.user.value = zootApp.payload.auth?.user ?? null
    auth.session.value = zootApp.payload.auth?.session ?? null

    auth.client.$store.listen('$sessionSignal', () => {
      auth.refreshSession()
    })
  }
  else {
    const { user, session } = zootApp.ssrContext!.context.get('auth')
    if (user && session) {
      auth.user.value = user
      auth.session.value = session

      zootApp.payload.auth = {
        user: auth.user.value,
        session: auth.session.value,
      }
    }
  }

  return {
    provide: {
      auth,
    },
  }
})

declare module '~~/lib/app' {
  interface ZootApp {
    $auth: Auth
  }
  interface ZootPayload {
    auth?: {
      user: User | null
      session: Session | null
    }
  }
}
