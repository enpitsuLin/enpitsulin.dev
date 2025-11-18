import type { MatchFunction } from 'path-to-regexp'
import type { ComponentType } from 'react'
import { match } from 'path-to-regexp'

export type RouterContext = Record<string, any>

export interface RouteParams {
  [name: string]: string | string[] | undefined
}

type MaybePromise<T> = Promise<T> | T

export type RouteResult = MaybePromise<RouteModule | undefined>

export interface RouteResolved<Context extends RouterContext = RouterContext> {
  router: Router<Context>
  route: Route<Context>
  baseUrl: string
  pathname: string
  params: RouteParams
}

export type RouteHandler = (request: Request) => Response

export interface HandlerRouteModule {
  default: RouteHandler
  GET?: RouteHandler
  POST?: RouteHandler
  PUT?: RouteHandler
  DELETE?: RouteHandler
  PATCH?: RouteHandler
  HEAD?: RouteHandler
  OPTIONS?: RouteHandler
  CONNECT?: RouteHandler
  TRACE?: RouteHandler
}

export interface ComponentRouteModule {
  default: ComponentType<unknown>
}

export type RouteModule = HandlerRouteModule | ComponentRouteModule

export type Route<Context extends RouterContext = RouterContext, Path extends string = string> = {
  path?: Path
  name?: string
  parent?: Route<Context> | null
  children?: Routes<Context> | null
  /**
   * If unspecified, the route will be matched using the path-to-regexp library.
   */
  match?: MatchFunction<RouteParams>
} & ({
  lazy?: () => Promise<RouteModule>
} | {
  component: ComponentType<unknown> | (() => Promise<{ default: ComponentType<unknown> }>)
} | {
  handler: HandlerRouteModule | (() => Promise<{ default: (request: Request) => Response }>)
})

export type Routes<Context extends RouterContext = RouterContext> = Array<Route<Context>>

// eslint-disable-next-line ts/no-empty-object-type
class Router<const Context extends RouterContext = {}> {
  root: Route<Context>

  baseUrl: string

  constructor(routes: Routes<Context> | Route<Context>, baseUrl: string = '') {
    if (!routes || typeof routes !== 'object') {
      throw new TypeError('Invalid routes')
    }
    this.baseUrl = baseUrl
    this.root = Array.isArray(routes)
      ? { path: '', children: routes, parent: null }
      : routes
    this.root.parent = null
  }

  * traverse() {
    // Use a stack for depth-first traversal
    const stack: Route<Context>[] = [this.root]

    while (stack.length > 0) {
      const route = stack.pop()!
      yield route

      // Add children to stack in reverse order to maintain original order in traversal
      if (route.children && Array.isArray(route.children)) {
        for (let i = route.children.length - 1; i >= 0; i--) {
          const child = route.children[i]
          if (child) {
            stack.push(child)
          }
        }
      }
    }
  }

  [Symbol.iterator]() {
    return this.traverse()
  }

  resolve(pathname: string): RouteResolved<Context> {
    const path = this.normalizePathname(pathname)
    const result = this.matchRoute(this.root, path, this.baseUrl)

    if (!result) {
      throw this.createNotFoundError()
    }

    return result
  }

  private normalizePathname(pathname: string): string {
    return pathname.startsWith(this.baseUrl)
      ? pathname.slice(this.baseUrl.length)
      : pathname
  }

  private ensureMatchFunction(route: Route<Context>): void {
    if (!route.match && route.path !== undefined) {
      const hasChildren = route.children && route.children.length > 0
      // If route has children, don't match the end of the path
      route.match = match<RouteParams>(route.path, { end: !hasChildren })
    }
  }

  private createRouteResolved(
    route: Route<Context>,
    baseUrl: string,
    pathname: string,
    params: RouteParams,
  ): RouteResolved<Context> {
    return {
      router: this,
      route,
      baseUrl,
      pathname,
      params,
    }
  }

  private matchChildren(
    route: Route<Context>,
    remainingPath: string,
    baseUrl: string,
    params: RouteParams,
  ): RouteResolved<Context> | null {
    if (!route.children) {
      return null
    }

    for (const child of route.children) {
      if (child) {
        const childMatch = this.matchRoute(child, remainingPath, baseUrl, params)
        if (childMatch) {
          return childMatch
        }
      }
    }

    return null
  }

  private matchRoute(
    route: Route<Context>,
    currentPath: string,
    currentBaseUrl: string,
    parentParams: RouteParams = {},
  ): RouteResolved<Context> | null {
    this.ensureMatchFunction(route)

    // Try to match current route
    if (route.match) {
      const matchResult = route.match(currentPath)
      if (matchResult) {
        const { path: matchedPath, params } = matchResult
        const mergedParams = { ...parentParams, ...params }

        // If route has no children, return the match
        if (!route.children || route.children.length === 0) {
          return this.createRouteResolved(route, currentBaseUrl, matchedPath, mergedParams)
        }

        // Try to match children
        const remainingPath = currentPath.slice(matchedPath.length)
        const childMatch = this.matchChildren(
          route,
          remainingPath,
          currentBaseUrl + matchedPath,
          mergedParams,
        )

        // Return child match if found, otherwise return current route
        return childMatch || this.createRouteResolved(route, currentBaseUrl, matchedPath, mergedParams)
      }
    }

    // If current route has no match function, try children
    return this.matchChildren(route, currentPath, currentBaseUrl, parentParams)
  }

  private createNotFoundError(): Error & { status?: number } {
    const error = new Error('Route not found') as Error & { status?: number }
    error.status = 404
    return error
  }
}

export { Router }
