import type { Session, User } from '~~/lib/auth-client'
import { createBaseAuthClient } from '~~/lib/auth-client'

export function useAuth() {
  const url = useRequestURL()

  const headers = useRequestHeaders()

  const client = createBaseAuthClient({
    baseURL: url.toString(),
    fetchOptions: {
      headers,
    },
  })

  const session = shallowRef<Session | null>(null)
  const user = shallowRef<User | null>(null)

  const isFetchingSession = ref(false)

  const fetchSession = async () => {
    if (isFetchingSession.value)
      return
    isFetchingSession.value = true
    const res = await client.getSession()
    if (res.error) {
      return
    }
    session.value = res.data?.session ?? null
    user.value = res.data?.user ?? null

    isFetchingSession.value = false

    return {
      session: session.value,
      user: user.value,
    }
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    signOut: client.signOut,
    fetchSession,
    client,
  }
}
