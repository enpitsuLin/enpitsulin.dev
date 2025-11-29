import type {
  AuthClient,
  InferActions,
  InferClientAPI,
  InferSessionFromClient,
  InferUserFromClient,
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'
import { createAuthClient } from 'better-auth/client'
import { defu } from 'defu'
import { baseClientOptions } from '~~/shared/auth-options'

interface RuntimeAuthConfig {
  redirectTo: RouteLocationRaw | string
}

export interface UseAuthReturn {
  session: Ref<Session | null>
  user: Ref<User | null>
  loggedIn: ComputedRef<boolean>
  signIn: InferActions<typeof baseClientOptions>['signIn'] & InferClientAPI<typeof baseClientOptions>['signIn']
  signUp: InferClientAPI<typeof baseClientOptions>['signUp']
  signOut: (opt?: { redirectTo?: RouteLocationRaw }) => ReturnType<InferClientAPI<typeof baseClientOptions>['signOut']>
  options: RuntimeAuthConfig
  fetchSession: () => Promise<{ user: User, session: Session } | undefined>
  client: AuthClient<typeof baseClientOptions>
}

export function useAuthSession(): UseAuthReturn {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient(defu(
    {
      baseURL: url.origin,
      fetchOptions: {
        headers,
      },
    },
    baseClientOptions,
  ))

  const options = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
    redirectTo: '/',
  })
  const session = useState<InferSessionFromClient<typeof baseClientOptions> | null>('auth:session', () => null)
  const user = useState<InferUserFromClient<typeof baseClientOptions> | null>('auth:user', () => null)
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)
  const activeOrganizationId = useCookie('activeOrganizationId')

  const fetchSession = async () => {
    if (sessionFetching.value)
      return
    sessionFetching.value = true
    try {
      const { data } = await client.getSession({
        fetchOptions: {
          headers,
        },
      })
      session.value = data?.session || null
      user.value = data?.user || null
      return data!
    }
    catch (error) {
      console.error('Error fetching session:', error)
      session.value = null
      user.value = null
    }
    finally {
      sessionFetching.value = false
    }
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal)
        return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      if (!user.value) {
        await navigateTo('/')
        return
      }
      const res = await client.signOut()
      session.value = null
      user.value = null
      activeOrganizationId.value = null
      if (redirectTo) {
        await navigateTo(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
    client,
  }
}
