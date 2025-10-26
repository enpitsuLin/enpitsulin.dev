// app/composables/useAuth.ts
import type { RouteLocationRaw } from 'vue-router'
import { client } from '~~/lib/auth-client'

export interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const router = useRouter()

  const options: RuntimeAuthConfig = {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  }

  const session = shallowRef<typeof client.$Infer.Session.session | null>(null)
  const user = shallowRef<typeof client.$Infer.Session.user | null>(null)
  const sessionFetching = shallowRef(false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      return
    }
    sessionFetching.value = true
    const { data } = await client.getSession()
    session.value = data?.session || null
    user.value = data?.user || null
    sessionFetching.value = false
    return data
  }

  onMounted(async () => {
    await fetchSession()
  })

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = await client.signOut()
      session.value = null
      user.value = null
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
