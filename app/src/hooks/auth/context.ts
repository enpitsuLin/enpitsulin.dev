'use client'

import type { Session, User } from '@/auth'
import type { authClient } from '@/lib/auth/client'
import { createContext } from '@ark-ui/react'

export interface AuthContextType {
  session: Session | null
  user: User | null
  signUp: typeof authClient.signUp
  signIn: typeof authClient.signIn
  signOut: typeof authClient.signOut
  fetchSession: () => Promise<void>
}

export const [AuthContextProvider, useAuthContext] = createContext<AuthContextType>({
  name: 'AuthContext',
  hookName: 'useAuthContext',
  providerName: 'AuthContextProvider',
})
