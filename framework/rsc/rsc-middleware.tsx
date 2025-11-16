import type { LayoutComponent, PageComponent, RootComponent } from '@framework/component.js'
import type { TreeNode } from '@framework/router/core/tree'
import type { MatchResult } from '@framework/router/matcher.js'
import type { APIHandler, APIModule, HonoEnv, Method, PageModule, RenderModule, RscPayload } from '@framework/server'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ErrorInfo } from 'react'
import type { ReactFormState } from 'react-dom/client'
import type { RenderRequest } from './request.js'
import * as ReactServer from '@vitejs/plugin-rsc/rsc'
import { createMiddleware } from 'hono/factory'
import { createElement } from 'react'
import { parseRenderRequest } from './request.js'

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

function isRenderRoute(route: MatchResult): route is MatchResult<RenderModule, { type: 'page' }> {
  if (!route.node.module || !route.node.meta)
    return false
  if (!('type' in route.node.meta))
    return false
  if (route.node.meta.type !== 'page')
    return false
  return true
}

async function handlePageRoute(
  c: Context<HonoEnv>,
  route: MatchResult<RenderModule, { type: 'page' }>,
  renderRequest: RenderRequest,
  Root?: RootComponent,
) {
  const pageNode = route.node

  const component = pageNode.value.module.default as PageComponent
  if (!component) {
    return c.notFound()
  }

  // handle server function request
  let returnValue: RscPayload['returnValue'] | undefined
  let formState: ReactFormState | undefined
  let temporaryReferences: unknown | undefined

  let actionStatus: ContentfulStatusCode | undefined

  if (renderRequest.isAction) {
    if (renderRequest.actionId) {
      // action is called via `ReactClient.setServerCallback`.
      const contentType = c.req.header('content-type')
      const body = contentType?.startsWith('multipart/form-data')
        ? await c.req.formData()
        : await c.req.text()
      temporaryReferences = ReactServer.createTemporaryReferenceSet()
      const args = await ReactServer.decodeReply(body, { temporaryReferences })
      const action = await ReactServer.loadServerAction(renderRequest.actionId)

      try {
        // eslint-disable-next-line prefer-spread
        const data = await action.apply(null, args)
        returnValue = { ok: true, data }
      }
      catch (e) {
        returnValue = { ok: false, data: e }
        actionStatus = 500
      }
    }
    else {
      // otherwise server function is called via `<form action={...}>`
      // before hydration (e.g. when javascript is disabled).
      // aka progressive enhancement.
      const formData = await c.req.formData()
      const decodedAction = await ReactServer.decodeAction(formData)
      try {
        const result = await decodedAction()
        formState = await ReactServer.decodeFormState(result, formData)
      }
      catch (e) {
        console.error('RSC form action failed:', e)
        // there's no single general obvious way to surface this error,
        // so explicitly return classic 500 response.
        return c.newResponse('Internal Server Error: server action failed', {
          status: 500,
        })
      }
    }
    c.set('rscActionResult', { returnValue, formState, temporaryReferences })
  }

  function Page() {
    return createElement(component, {
      path: route!.matchedPath,
      params: route!.params,
    })
  }

  const rscPayload: RscPayload = {
    root: (
      <StackLayouts route={route} Root={Root}>
        <Page />
      </StackLayouts>
    ),
    formState,
    returnValue,
  }
  let error: unknown
  const rscOptions = {
    temporaryReferences,
    onError: (e: unknown, errorInfo: ErrorInfo) => {
      console.error('Error during rendering:', e, errorInfo)
      error = e
      if (
        e
        && typeof e === 'object'
        && 'digest' in e
        && typeof e.digest === 'string'
      ) {
        return e.digest
      }
    },
  }

  const rscStream = ReactServer.renderToReadableStream<RscPayload>(
    rscPayload,
    rscOptions,
  )

  if (error) {
    // TODO handle rsc notFound
    return
  }

  if (renderRequest.isRsc) {
    return c.body(rscStream, actionStatus, {
      'content-type': 'text/x-component;charset=utf-8',
      'vary': 'accept',
    })
  }

  // Delegate to SSR environment for html rendering.
  // The plugin provides `loadModule` helper to allow loading SSR environment entry module
  // in RSC environment. however this can be customized by implementing own runtime communication
  // e.g. `@cloudflare/vite-plugin`'s service binding.
  const ssrEntryModule = await import.meta.viteRsc.loadModule<
    typeof import('./entry-server.js')
  >('ssr', 'index')
  const ret = await ssrEntryModule.renderHTML(rscStream, {
    formState,
    debugNojs: renderRequest.url.searchParams.has('__nojs'),
  })

  if (typeof ret === 'string' && ret === 'notFound') {
    return 'notFound'
  }

  const { stream, status } = ret
  return c.body(stream, status, {
    'Content-Type': 'text/html; charset=utf-8',
    'vary': 'accept',
  })
}

function findClosestCatchAll(node: TreeNode<PageModule, { type: 'page' }>): TreeNode<PageModule, { type: 'page' }> | null {
  if (!node.parent)
    return null

  if (node.parent.isCatchAll)
    return node.parent

  const nodes = node.parent.getChildrenSorted()
  const n = nodes.find(node => node.isCatchAll)

  if (n)
    return n

  return findClosestCatchAll(node.parent)
}

export function rscMiddle({ getRoot }: RscRendererOptions = {}) {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const renderRequest = parseRenderRequest(c.req.raw)
    const router = c.get('router')
    const route = router.match(renderRequest.url.pathname)

    if (route) {
      if (isApiRoute(route)) {
        return handleApiRoute(c, route)
      }
      else if (isRenderRoute(route)) {
        const Root = await getRoot?.()
        const res = await handlePageRoute(c, route, renderRequest, Root)
        if (typeof res === 'string' && res === 'notFound') {
          const closetCatchAll = findClosestCatchAll(route.node)
          if (closetCatchAll) {
            const toRoute = {
              ...route,
              node: closetCatchAll,
            } as MatchResult<RenderModule, { type: 'page' }>
            return handlePageRoute(c, toRoute, renderRequest, Root) as Promise<Response>
          }
          return c.notFound()
        }
        else {
          return res
        }
      }
    }

    await next()
  })
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
