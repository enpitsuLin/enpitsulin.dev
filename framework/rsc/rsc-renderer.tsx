import type { LayoutComponent, RootComponent } from '@framework/component.js'
import type { TreeNode } from '@framework/router/core/tree'
import type { HonoEnv, RscPayload } from '@framework/server'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ReactFormState } from 'react-dom/client'
import * as ReactServer from '@vitejs/plugin-rsc/rsc'
import { createMiddleware } from 'hono/factory'
import { createElement } from 'react'
import { parseRenderRequest } from './request'

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
    (component: React.ReactNode, props?: Props): Response | Promise<Response>
  }
}

export function rscRenderer({ getRoot }: RscRendererOptions = {}) {
  return createMiddleware<HonoEnv>(async (c, next) => {
    // Get root component
    const Root = await getRoot?.()
    const request = c.req.raw

    // differentiate RSC, SSR, action, etc.
    const renderRequest = parseRenderRequest(request)
    // handle server function request
    let returnValue: RscPayload['returnValue'] | undefined
    let formState: ReactFormState | undefined
    let temporaryReferences: unknown | undefined

    let actionStatus: ContentfulStatusCode | undefined

    if (renderRequest.isAction) {
      if (renderRequest.actionId) {
        // action is called via `ReactClient.setServerCallback`.
        const contentType = request.headers.get('content-type')
        const body = contentType?.startsWith('multipart/form-data')
          ? await request.formData()
          : await request.text()
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
        const formData = await request.formData()
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

    // Set up the render function
    c.setRenderer(async (component: React.ReactNode, _props?: Props) => {
      // Get action results if they exist
      const actionResult = c.get('rscActionResult') || {}
      const route = c.get('route')
      const { returnValue, formState, temporaryReferences } = actionResult

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

      function RscRoot({ children }: React.PropsWithChildren) {
        let content: React.ReactNode = children

        // Collect all layouts from the matched route
        if (route) {
          const layouts = collectLayouts(route.node)

          // Wrap children with layouts from innermost to outermost
          for (let i = layouts.length - 1; i >= 0; i--) {
            const Layout = layouts[i]!
            content = createElement(Layout, { children: content })
          }
        }

        // Wrap with root component if it exists
        if (Root) {
          return <Root>{content}</Root>
        }

        return content
      }

      // Create RSC payload with the component wrapped in Layout
      const rscPayload: RscPayload = {
        root: <RscRoot>{component}</RscRoot>,
        formState,
        returnValue,
      }
      const rscOptions = { temporaryReferences }

      const rscStream = ReactServer.renderToReadableStream<RscPayload>(
        rscPayload,
        rscOptions,
      )

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
      const { stream, status } = await ssrEntryModule.renderHTML(rscStream, {
        formState,
        debugNojs: renderRequest.url.searchParams.has('__nojs'),
      })

      return c.body(stream, status, {
        'Content-Type': 'text/html; charset=utf-8',
        'vary': 'accept',
      })
    })

    await next()
  })
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
