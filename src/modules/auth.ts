import type { BetterFetchPlugin } from 'better-auth/client'
import type { Session, User } from '~~/lib/auth'
import type { Client } from '~~/lib/auth-client'
import type { UserModule } from '~/types'
import { createConsola } from 'consola'
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

function fetchLoggerPlugin() {
  const consola = createConsola()
  return {
    id: 'logger',
    name: 'logger',
    hooks: {
      onRequest(context) {
        consola.log('Request being sent to:', context.url.toString())
      },
      async onSuccess(context) {
        consola.success('Request succeeded', context.data)
      },
      onRetry(response) {
        consola.log(
          'Retrying request...',
          'Attempt:',
          (response.request.retryAttempt || 0) + 1,
        )
      },
      async onError(context) {
        let obj: any
        try {
          const res = context.response.clone()
          const json = await res.json()
          if (json) {
            obj = json
          }
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (e) {}
        consola.log(
          'Request failed with status: ',
          context.response.status,
          `(${context.response.statusText || context.response.status})`,
        )
        obj && consola.error(obj)
      },
    },
  } as BetterFetchPlugin
}

export const install: UserModule = ({ app, initialState, hooks }) => {
  if (!import.meta.env.SSR) {
    const url = new URL(globalThis.location.href)
    const client = createBaseAuthClient({
      baseURL: url.origin,
    })
    const $auth: Auth = {
      client,
      session: shallowRef<Session | null>(null),
      user: shallowRef<User | null>(null),
    }

    const isFetchingSession = ref(false)

    if (!import.meta.env.SSR) {
      client.$store.listen('$sessionSignal', async () => {
        if (isFetchingSession.value)
          return
        isFetchingSession.value = true
        const res = await client.getSession()
        if (res.error) {
          return
        }
        $auth.session.value = res.data?.session ?? null
        $auth.user.value = res.data?.user ?? null
        isFetchingSession.value = false
      })
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
          plugins: [
            fetchLoggerPlugin(),
          ],
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
