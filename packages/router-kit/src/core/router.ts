import type { RouterContext } from '../context'
import { Route } from './route'

export interface RouteParams {
  [name: string]: string | string[] | undefined
}

export interface RouteResolved<Context extends RouterContext = RouterContext> {
  router: Router<Context>
  route: Route<Context>
  pathname: string
  params: RouteParams
}

export type Routes<
  Context extends RouterContext = RouterContext,
> = Array<Route<Context>>

class Router<
  const Context extends RouterContext = RouterContext,
  const Paths extends string = '/',
> {
  root: Route<Context>

  routesMap: Map<string, Route<Context>> = new Map()

  constructor() {
    this.root = new Route('')
  }

  insert<const Path extends string = string>(
    path: Path,
    context: Context,
  ): Router<Context, Paths | Path> {
    const route = this.root.insert(path, context)
    this.routesMap.set(route.fullPath, route)
    return this
  }

  resolve(_path: string): RouteResolved<Context> {
    throw new Error('not implemented')
  }
}

export { Router }
