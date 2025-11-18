'use client'

import type { TreePathParam } from '@framework/router'
import type { AuthContextType } from '@/hooks/auth/context'
import { RoutesProvider } from '@framework/router/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/auth/provider'

const queryClient = new QueryClient()

export interface GlobalProviderProps extends Pick<AuthContextType, 'session' | 'user'> {
  children: React.ReactNode
  path: string
  params: Record<string, string | string[] | undefined>
  routes: Array<{ path: string, params: TreePathParam[] }>
}

export function GlobalProvider({
  session,
  user,
  children,
  path,
  params,
  routes,
}: GlobalProviderProps) {
  return (
    <RoutesProvider
      routes={routes}
      route={{
        path,
        params,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider session={session} user={user}>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </RoutesProvider>
  )
}
