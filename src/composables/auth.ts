import { useAuthContext } from '~/modules/auth'

export function useAuth() {
  const $auth = useAuthContext()

  const client = $auth.client
  const session = $auth.session
  const user = $auth.user

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
