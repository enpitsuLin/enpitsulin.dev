import type { RouteLocationRaw } from 'vue-router'
// app/composables/useAuth.ts
import { useMutation } from '@pinia/colada'
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
