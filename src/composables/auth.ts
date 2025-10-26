// app/composables/useAuth.ts
import type { RouteLocationRaw } from 'vue-router'
import { client, useSession } from '~~/lib/auth-client'

export interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const options: RuntimeAuthConfig = {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  }

  const session = useSession()

  const sessionFetching = shallowRef(false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }

    sessionFetching.value = true
    const { data } = await client.getSession()
    sessionFetching.value = false
    return data
  }

  return {
    session,
    user: computed(() => session.value.data?.user || null),
    loggedIn: computed(() => !!session.value.data?.session),
    signIn: client.signIn,
    signUp: client.signUp,
    signOut: client.signOut,
    options,
    fetchSession,
    client,
  }
}
