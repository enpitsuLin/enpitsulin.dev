'use client'

import type { AuthContextType } from './context'
import type { Session, User } from '@/auth'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth/client'
import { AuthContextProvider } from './context'

export interface AuthProviderProps extends Pick<AuthContextType, 'session' | 'user'> {
  children: React.ReactNode
}

export function AuthProvider({
  session,
  user,
  children,
}: AuthProviderProps) {
  const { data, refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const session = await authClient.getSession()
      if (!session) {
        return {
          session: null,
          user: null,
        }
      }
      return {
        session: session.data?.session as Session,
        user: session.data?.user as User,
      }
    },
    initialData: {
      session,
      user,
    },
  })

  useEffect(() => {
    const sessionSignal = authClient.$store.atoms.$sessionSignal
    if (!sessionSignal) {
      return
    }

    return sessionSignal.subscribe(() => {
      refetch()
    })
  }, [])

  return (
    <AuthContextProvider
      value={{
        session: data.session,
        user: data.user,
        signIn: authClient.signIn,
        signOut: authClient.signOut,
        signUp: authClient.signUp,
        fetchSession: async () => {
          await refetch()
        },
      }}
    >
      {children}
    </AuthContextProvider>
  )
}
