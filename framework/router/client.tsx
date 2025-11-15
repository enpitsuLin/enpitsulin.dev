'use client'

import type { TreePathParam } from './core/tree-node-value'
import { createContext, use } from 'react'

export interface RouteProps {
  /** resloved path */
  path: string
  params: Record<string, string | string[] | undefined>
}

interface Route {
  path: string
  params: TreePathParam[]
}

interface RouteContextType {
  routes: Route[]
  currentRoute: RouteProps
}

const RouterContext = createContext<RouteContextType | null>(null)

export interface RoutesProviderProps extends React.PropsWithChildren {
  routes: Route[]
  route: RouteProps
}

export function RoutesProvider({
  routes,
  route,
  children,
}: RoutesProviderProps) {
  return (
    <RouterContext
      value={{
        routes,
        currentRoute: route,
      }}
    >
      {children}
    </RouterContext>
  )
}

export function useRoutes() {
  const context = use(RouterContext)
  if (!context) {
    throw new Error('useRoutes must be used within a RouteProvider')
  }
  return context.routes
}

export function useRouter() {
  const context = use(RouterContext)
  if (!context) {
    throw new Error('useRoutes must be used within a RouteProvider')
  }
  return {
    route: context.currentRoute,
  }
}
