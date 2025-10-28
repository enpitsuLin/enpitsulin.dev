import type { AuthContext } from '~~/lib/auth-client'
import type { UserModule } from '~/types'
import * as devalue from 'devalue'

export const install: UserModule = ({ app, initialState, hooks }) => {
  if (!import.meta.env.SSR) {
    const { session, user } = app.runWithContext(() => useAuth())

    const authContext = devalue.parse(initialState.authContext) as AuthContext

    session.value = authContext.session ?? null
    user.value = authContext.user ?? null
  }
  else {
    hooks.hook('app:mounted', async () => {
      const { fetchSession } = app.runWithContext(() => useAuth())

      const authContext: AuthContext = { session: null, user: null }
      const res = await fetchSession()
      if (res) {
        authContext.session = res.session
        authContext.user = res.user
      }

      initialState.authContext = devalue.stringify(authContext)
    })
  }
}

declare module '~/types' {
  interface AppInitialState {
    authContext: string
  }
}
