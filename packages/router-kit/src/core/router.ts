import type { RouterContext } from '../context'
import type { ExtractRouteParams } from '../utils/type'
import type { Route } from './route'

export interface RouteParams {
  [name: string]: string | string[] | undefined
}

export interface RouteResolved<
  Context extends RouterContext = RouterContext,
  Path extends string = string,
> {
  router: Router<Context>
  route: Route<Context>
  baseUrl: string
  pathname: string
  params: ExtractRouteParams<Path>
}

export type Routes<
  Context extends RouterContext = RouterContext,
> = Array<Route<Context>>

class Router<
  const Context extends RouterContext = RouterContext,
  const Paths extends string = '/',
> {
  root: Route<Context>
  baseUrl: string

  routesMap: Map<string, Route<Context>> = new Map()

  constructor() {
    throw new Error('not implemented')
  }

  insert<const Path extends string = string>(
    _path: Path,
    _route: Context,
  ): Router<Context, Paths | Path> {
    throw new Error('not implemented')
  }
}

export { Router }
