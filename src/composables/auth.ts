import type { BetterAuthClientOptions } from 'better-auth'
import { createAuthClient } from 'better-auth/vue'
import { baseClientOptions } from '~~/lib/auth-options'

type Client = ReturnType<typeof createBaseAuthClient>
type Session = Client['$Infer']['Session']['session']
type User = Client['$Infer']['Session']['user']

function createBaseAuthClient(options: BetterAuthClientOptions) {
  return createAuthClient({
    ...options,
    ...baseClientOptions,
  })
}

export const useAuth = createGlobalState(
  () => {
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
  },
)
