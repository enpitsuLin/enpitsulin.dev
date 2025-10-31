import type { BetterFetchPlugin } from 'better-auth/client'
import type { Session, User } from '~~/lib/auth'
import type { Client } from '~~/lib/auth-client'
import type { UserModule } from '~/types'
import * as devalue from 'devalue'
import { createBaseAuthClient } from '~~/lib/auth-client'
import { logger } from '~~/lib/logger'

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
  return {
    id: 'logger',
    name: 'logger',
    hooks: {
      onRequest(context) {
        logger.log('Request being sent to:', context.url.toString())
      },
      async onSuccess(context) {
        logger.success('Request succeeded', context.request.url.toString())
      },
      onRetry(response) {
        logger.log(
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
        logger.log(
          'Request failed with status: ',
          context.response.status,
          `(${context.response.statusText || context.response.status})`,
        )
        obj && logger.error(obj)
      },
    },
  } as BetterFetchPlugin
}

export const install: UserModule = ({ app, initialState, hooks }) => {
  const session = shallowRef<Session | null>(null)
  const user = shallowRef<User | null>(null)

  if (!import.meta.env.SSR) {
    const url = new URL(globalThis.location.href)
    const client = createBaseAuthClient({
      baseURL: url.origin,
    })
    const $auth: Auth = {
      client,
      session,
      user,
    }

    const isFetchingSession = ref(false)

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

    app.config.globalProperties.$auth = $auth
    app.provide(AuthContextSymbol, $auth)
    const authContext = devalue.parse(initialState.authContext) as {
      session: Session | null
      user: User | null
    }

    $auth.session.value = authContext.session
    $auth.user.value = authContext.user
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
        session,
        user,
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
