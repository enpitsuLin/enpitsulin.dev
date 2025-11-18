import type { MatchFunction } from 'path-to-regexp'
import type { ComponentType } from 'react'
import type { ExtractRouteParams, FlattenNodePaths, MostMatchPath } from '../utils/type'
import { match } from 'path-to-regexp'

export type RouterContext = Record<string, any>

export interface RouteParams {
  [name: string]: string | string[] | undefined
}

type MaybePromise<T> = Promise<T> | T

export type RouteResult = MaybePromise<RouteModule | undefined>

export interface RouteResolved<
  Context extends RouterContext = RouterContext,
  Path extends string = string,
> {
  router: Router<Context>
  route: Route<Context, Path, ExtractRouteParams<Path>>
  baseUrl: string
  pathname: string
  params: ExtractRouteParams<Path>
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

export interface Route<
  Context extends RouterContext = RouterContext,
  Path extends string = string,
  Params extends Record<string, any> = ExtractRouteParams<Path>,
> {
  path: Path
  name?: string
  parent?: Route<Context, any, any> | null
  children?: Routes<Context, any, any>
  /**
   * If unspecified, the route will be matched using the path-to-regexp library.
   */
  match?: MatchFunction<Params>
  lazy?: () => Promise<RouteModule>
  component?: ComponentType<unknown> | (() => Promise<{ default: ComponentType<unknown> }>)
  handler?: HandlerRouteModule | (() => Promise<{ default: (request: Request) => Response }>)
}

export type Routes<
  Context extends RouterContext = RouterContext,
  Path extends string = string,
  Params extends Record<string, any> = ExtractRouteParams<Path>,
> = Array<Route<Context, Path, Params>>

class Router<
  const Context extends RouterContext = RouterContext,
  const R extends Route<Context> = Route<Context>,
  const Base extends string = '',
> {
  root: Route<Context>

  baseUrl: string

  constructor(route: R, baseUrl?: Base)
  constructor(routes: NonNullable<R['children']>, baseUrl?: Base)
  constructor(routes: Routes<Context> | Route<Context>, baseUrl = '') {
    if (!routes || typeof routes !== 'object') {
      throw new TypeError('Invalid routes')
    }
    this.baseUrl = baseUrl
    this.root = Array.isArray(routes)
      ? { path: '', children: routes, parent: null } as Route<Context>
      : routes
    this.root.parent = null
  }

  * traverse() {
    // Use a stack for depth-first traversal
    const stack: Route<Context, any, any>[] = [this.root]

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

  resolve<const Path extends string = string>(
    pathname: Path,
  ): RouteResolved<Context, MostMatchPath<Path, FlattenNodePaths<R>>> {
    const path = this.normalizePathname(pathname)
    const result = this.matchRoute(this.root, path, this.baseUrl)

    if (!result) {
      throw this.createNotFoundError()
    }

    return result as RouteResolved<Context, MostMatchPath<Path, FlattenNodePaths<R>>>
  }

  private normalizePathname(pathname: string): string {
    return pathname.startsWith(this.baseUrl)
      ? pathname.slice(this.baseUrl.length)
      : pathname
  }

  private ensureMatchFunction(route: Route<Context, any, any>): void {
    if (!route.match && route.path !== undefined) {
      const hasChildren = route.children && route.children.length > 0
      // If route has children, don't match the end of the path
      route.match = match<RouteParams>(route.path, { end: !hasChildren })
    }
  }

  private createRouteResolved(
    route: Route<Context, any, any>,
    baseUrl: string,
    pathname: string,
    params: RouteParams,
  ): RouteResolved<Context, any> {
    return {
      router: this,
      route,
      baseUrl,
      pathname,
      params,
    }
  }

  private matchChildren(
    route: Route<Context, any, any>,
    remainingPath: string,
    baseUrl: string,
    params: RouteParams,
  ): RouteResolved<Context, any> | null {
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
    route: Route<Context, any, any>,
    currentPath: string,
    currentBaseUrl: string,
    parentParams: RouteParams = {},
  ): RouteResolved<Context, any> | null {
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

export class InsertableRouter<
  const Context extends RouterContext = RouterContext,
  const Paths extends string = '/',
> {
  insert<const Path extends string = string>(
    _path: Path,
    _route: Omit<Route<Context, Path, ExtractRouteParams<Path>>, 'path'>,
  ): InsertableRouter<Context, Paths | Path> {
    throw new Error('Not implemented')
  }

  resolve<const Path extends string = string>(
    _pathname: Path,
  ): RouteResolved<Context, MostMatchPath<Path, Paths>> {
    throw new Error('Not implemented')
  }
}

export { Router }
