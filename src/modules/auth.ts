import type { Client, Session, User } from '~~/lib/auth-client'
import type { UserModule } from '~/types'
import * as devalue from 'devalue'
import { createBaseAuthClient } from '~~/lib/auth-client'

export interface Auth {
  session: ShallowRef<Session | null>
  user: ShallowRef<User | null>
  client: Client
}

export const AuthContextSymbol = Symbol('authContext') as InjectionKey<Auth>

export function useAuthContext() {
  const $auth = inject(AuthContextSymbol)
  if (!$auth) {
    throw new Error('Auth context not found')
  }
  return $auth
}

export const install: UserModule = ({ app, initialState, hooks }) => {
  if (!import.meta.env.SSR) {
    const url = new URL(globalThis.location.href)
    const $auth: Auth = {
      client: createBaseAuthClient({
        baseURL: url.origin,
      }),
      session: shallowRef<Session | null>(null),
      user: shallowRef<User | null>(null),
    }

    app.config.globalProperties.$auth = $auth
    app.provide(AuthContextSymbol, $auth)
    const { session, user } = devalue.parse(initialState.authContext) as {
      session: Session | null
      user: User | null
    }

    $auth.session.value = session
    $auth.user.value = user
  }
  else {
    hooks.hook('app:beforeRender', async (app, ssrContext) => {
      const url = new URL(ssrContext.event.req.url)

      const headers = import.meta.env.SSR
        ? Object.fromEntries(ssrContext.event.req.headers)
        : useRequestHeaders()

      const client = createBaseAuthClient({
        baseURL: url.origin,
        fetchOptions: {
          headers,
          customFetchImpl: ssrContext.internalFetch,
        },
      })

      const $auth: Auth = {
        client,
        session: shallowRef<Session | null>(null),
        user: shallowRef<User | null>(null),
      }

      app.config.globalProperties.$auth = $auth
      app.provide(AuthContextSymbol, $auth)

      const res = await client.getSession()
      if (res) {
        $auth.session.value = res.data?.session ?? null
        $auth.user.value = res.data?.user ?? null
      }

      initialState.authContext = devalue.stringify({
        session: $auth.session.value,
        user: $auth.user.value,
      })
    })
  }
}

declare module '~/types' {
  interface AppInitialState {
    authContext: string
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth: Auth
  }
}
