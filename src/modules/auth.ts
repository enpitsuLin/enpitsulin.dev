import type { UserModule } from '~/types'
import * as devalue from 'devalue'

export const install: UserModule = ({ app, initialState, hooks }) => {
  if (!import.meta.env.SSR) {
    const { session, user } = app.runWithContext(() => useAuth())

    const authContext = devalue.parse(initialState.authContext)
    session.value = authContext.session ?? null
    user.value = authContext.user ?? null
  }
  else {
    hooks.hook('app:after-render', async () => {
      const { fetchSession } = app.runWithContext(() => useAuth())
      const res = await fetchSession()
      if (!res) {
        return
      }
      initialState.authContext = devalue.stringify({ session: res.session, user: res.user })
    })
  }
}
