// app/composables/useAuth.ts
import type { RouteLocationRaw } from 'vue-router'
import { client } from '~~/lib/auth-client'

export interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}
const { useSession } = client
export function useAuth() {
  const router = useRouter()

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
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = await client.signOut()
      if (redirectTo) {
        await router.push(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
    client,
  }
}
