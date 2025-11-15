import type { MatchResult } from './matcher'
import { TreeNode } from './core/tree'
import { match } from './matcher'

export interface CreateRouteOptions {
  base?: string
}

export interface CreateRouteContext<Module = any, Meta extends Record<string, any> = Record<string, any>> {
  addRoute: (path: string, module: Module, meta?: Meta) => void
  tree: TreeNode<Module, Meta>
}

export interface Router<Module = any, Meta extends Record<string, any> = Record<string, any>> {
  tree: TreeNode<Module, Meta>
  match: (path: string) => MatchResult<Module, Meta> | null
}

export function createRoutes<
  Module = any,
  Meta extends Record<string, any> = Record<string, any>,
>(
  fn: (ctx: CreateRouteContext<Module, Meta>) => void,
  opts: CreateRouteOptions = {},
): Router<Module, Meta> {
  const tree = new TreeNode<Module, Meta>(opts?.base || '/')

  function addRoute(path: string, module: Module, meta?: Meta) {
    tree.insert(path, module, meta)
  }

  fn({ addRoute, tree })

  return {
    tree,
    match: (path: string) => match(path, tree),
  }
}

export async function createRoutesAsync<
  Module = any,
  Meta extends Record<string, any> = Record<string, any>,
>(
  fn: (ctx: CreateRouteContext<Module, Meta>) => Promise<void>,
  opts: CreateRouteOptions = {},
): Promise<Router<Module, Meta>> {
  const tree = new TreeNode<Module, Meta>(opts?.base || '/')

  function addRoute(path: string, module: Module, meta?: Meta) {
    tree.insert(path, module, meta)
  }

  await fn({ addRoute, tree })

  return {
    tree,
    match: (path: string) => match(path, tree),
  }
}
