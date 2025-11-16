import type { LayoutComponent, PageComponent, RootComponent } from '@framework/component.js'
import type { TreeNode } from '@framework/router/core/tree'
import type { MatchResult } from '@framework/router/matcher.js'
import type { APIHandler, APIModule, HonoEnv, Method, RscPayload } from '@framework/server'
import type { Context } from 'hono'
import { getErrorInfo } from '@framework/lib/custom-error.js'
import { toProcessRequest } from '@framework/lib/request/parse'
import { getContext } from '@framework/server'
import { createMiddleware } from 'hono/factory'
import { createElement } from 'react'

// Props interface that can be extended by users
export interface Props {
  children?: React.ReactNode
}

export interface RscRendererOptions {
  getRoot?: () => RootComponent | Promise<RootComponent>
}

// This declaration is necessary to type the c.render() method in Hono
declare module 'hono' {
  interface ContextRenderer {
    (component: PageComponent): Response | Promise<Response>
  }
}

/**
 * Collect all layout components from the current node up to the root
 * Returns an array of layout components from outermost to innermost
 */
function collectLayouts(node: TreeNode | undefined): LayoutComponent[] {
  const layouts: LayoutComponent[] = []
  let currentNode: TreeNode | undefined = node

  // Traverse up the tree, collecting layouts
  while (currentNode) {
    if (currentNode.layout && currentNode.layout.value.module?.default) {
      layouts.unshift(currentNode.layout.value.module.default as LayoutComponent)
    }
    currentNode = currentNode.parent
  }

  return layouts
}

function StackLayouts({
  Root,
  children,
  route,
}: React.PropsWithChildren<{
  Root?: RootComponent
  route: HonoEnv['Variables']['route']
}>) {
  let content: React.ReactNode = children

  // Collect all layouts from the matched route
  if (route) {
    const layouts = collectLayouts(route.node)
    // Wrap children with layouts from innermost to outermost
    content = layouts.reduce((content, Layout) => {
      return createElement(Layout, { children: content })
    }, content)
  }

  if (Root) {
    return <Root>{content}</Root>
  }

  return content
}

function isApiRoute(route: MatchResult): route is MatchResult<APIModule, { type: 'api' }> {
  if (!route.node.module || !route.node.meta)
    return false
  if (!('type' in route.node.meta))
    return false
  if (route.node.meta.type !== 'api')
    return false
  return true
}

function handleApiRoute(c: Context<HonoEnv>, route: MatchResult<APIModule, { type: 'api' }>) {
  const hasWildcardHandler = 'default' in route.node.value.module

  if (hasWildcardHandler) {
    const handler = route.node.value.module.default as APIHandler
    return handler(c.req.raw)
  }

  const handler = route.node.value.module[c.req.method.toUpperCase() as Method]
  if (!handler) {
    return c.notFound()
  }
  return handler(c.req.raw)
}

async function getMatchForRoute(path: string) {
  const ctx = getContext()
  const route = ctx.var.router.match(path)
  if (!route)
    return null
  return route
}

export function rscMiddle({ getRoot }: RscRendererOptions = {}) {
  const handle = toProcessRequest(async ({
    input,
    renderUtils: { renderHtml, renderRsc },
  }, c) => {
    const match = await getMatchForRoute(input.pathname)
    if (!match)
      return null

    c.set('route', match)
    if (input.type === 'component') {
      const Root = await getRoot?.()
      const component = match.node.module.default as PageComponent

      console.error('rsc-middleware L120')
      return renderRsc({
        root: (
          <StackLayouts route={match} Root={Root}>
            {createElement(component, {
              path: match!.matchedPath,
              params: match!.params,
            })}
          </StackLayouts>
        ),
        returnValue: undefined,
      })
    }
    if (input.type === 'function') {
      try {
        const Root = await getRoot?.()
        const component = match.node.module.default as PageComponent
        const value = await input.fn(...input.args)

        console.error('rsc-middleware L139')
        return renderRsc({
          root: (
            <StackLayouts route={match} Root={Root}>
              {createElement(component, {
                path: match!.matchedPath,
                params: match!.params,
              })}
            </StackLayouts>
          ),
          returnValue: {
            ok: true,
            data: value,
          },
        })
      }
      catch (error) {
        const info = getErrorInfo(error)
        if (info?.location) {
          const match = await getMatchForRoute(info.location)
          if (!match)
            return new Response('not found todo') // TODO: to notFound

          const Root = await getRoot?.()
          const component = match.node.module.default as PageComponent

          console.error('rsc-middleware L165')
          return renderRsc({
            root: (
              <StackLayouts route={match} Root={Root}>
                {createElement(component, {
                  path: match!.matchedPath,
                  params: match!.params,
                })}
              </StackLayouts>
            ),
            returnValue: undefined,
          })
        }
        throw error
      }
      finally {
        // do some cleanup?
      }
    }

    if (match && isApiRoute(match)) {
      return handleApiRoute(c, match)
    }

    if (input.type === 'action' || input.type === 'custom') {
      const renderIt = async (pathname: string) => {
        const match = await getMatchForRoute(pathname)
        if (!match) {
          return null
        }
        const formState = input.type === 'action' ? await input.fn() : undefined

        const Root = await getRoot?.()
        const component = match.node.module.default as PageComponent

        const payload: RscPayload = {
          root: (
            <StackLayouts route={match} Root={Root}>
              {createElement(component, {
                path: match!.matchedPath,
                params: match!.params,
              })}
            </StackLayouts>
          ),
          formState,
          returnValue: {
            ok: true,
            data: undefined,
          },
        }

        console.error('rsc-middleware L216')
        return renderHtml(payload)
      }

      try {
        return renderIt(input.pathname)
      }
      catch (error) {
        console.error('rsc middleware L217')
        const info = getErrorInfo(error)
        if (info?.status !== 404) {
          throw error
        }
      }
      // detect has catch-all page
      if (!false) {
        return new Response('test')
      }
      else {
        return null
      }
    }

    return null
  })
  return createMiddleware<HonoEnv>(async (c, next) => {
    const res = await handle(c)
    if (res)
      return res
    await next()
  })
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
