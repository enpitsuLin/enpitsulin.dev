import type { RouteLocationRaw } from 'vue-router'
import { useMutation } from '@pinia/colada'
import { createAuthClient } from 'better-auth/vue'
import { baseClientOptions } from '~~/lib/auth-options'

export interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const options: RuntimeAuthConfig = {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  }

  const url = useRequestURL()

  const headers = useRequestHeaders()

  const client = createAuthClient({
    baseURL: url.toString(),
    fetchOptions: {
      headers,
    },
    ...baseClientOptions,
  })

  const session = client.useSession()

  const { mutateAsync } = useMutation({
    mutation: async () => {
      const { data } = await client.getSession()
      return data
    },
    onError: (error) => {
      console.error(error)
    },

  })

  return {
    session,
    user: computed(() => session.value.data?.user || null),
    loggedIn: computed(() => !!session.value.data?.session),
    signIn: client.signIn,
    signUp: client.signUp,
    signOut: client.signOut,
    options,
    fetchSession: mutateAsync,
    client,
  }
}
