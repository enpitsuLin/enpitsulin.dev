'use client'

import type { AuthContextType } from '@/hooks/auth/context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/auth/provider'

const queryClient = new QueryClient()

export interface GlobalProviderProps extends Pick<AuthContextType, 'session' | 'user'> {
  children: React.ReactNode

}

export function GlobalProvider({
  session,
  user,
  children,
}: GlobalProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider session={session} user={user}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
