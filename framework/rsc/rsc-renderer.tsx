import type { LayoutComponent, RootComponent } from '@framework/component.js'
import type { TreeNode } from '@framework/router/core/tree'
import type { HonoEnv, RscPayload } from '@framework/server'
import type { ReactFormState } from 'react-dom/client'
import * as ReactServer from '@vitejs/plugin-rsc/rsc'
import { createMiddleware } from 'hono/factory'
import { createElement } from 'react'

// Props interface that can be extended by users
export interface Props {
  children?: React.ReactNode
}

export interface RscRendererOptions {

}

// This declaration is necessary to type the c.render() method in Hono
declare module 'hono' {
  interface ContextRenderer {
    (component: React.ReactNode, props?: Props): Response | Promise<Response>
  }
}

export function rscRenderer(_options: RscRendererOptions = {}) {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const request = c.req.raw

    // Handle server actions (POST requests)
    if (request.method === 'POST') {
      let returnValue: unknown | undefined
      let formState: ReactFormState | undefined
      let temporaryReferences: unknown | undefined

      const actionId = request.headers.get('x-rsc-action')
      const contentType = request.headers.get('content-type')

      if (actionId) {
        const body = contentType?.startsWith('multipart/form-data')
          ? await request.formData()
          : await request.text()
        temporaryReferences = ReactServer.createTemporaryReferenceSet()
        const args = await ReactServer.decodeReply(body, { temporaryReferences })
        const action = await ReactServer.loadServerAction(actionId)
        // eslint-disable-next-line prefer-spread
        returnValue = await action.apply(null, args)
      }
      else if (contentType?.startsWith('multipart/form-data')) {
        const formData = await request.formData()
        const decodedAction = await ReactServer.decodeAction(formData)
        const result = await decodedAction()
        formState = await ReactServer.decodeFormState(result, formData)
      }

      // Store action results in context for render
      c.set('rscActionResult', { returnValue, formState, temporaryReferences })
    }

    // Set up the render function
    c.setRenderer(async (component: React.ReactNode, _props?: Props) => {
      // Get action results if they exist
      const actionResult = c.get('rscActionResult') || {}
      const router = c.get('router')
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
        // Get root component
        const rootMatch = router.match('_root')
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
        if (rootMatch) {
          const Root = rootMatch.node.value.module.default as RootComponent
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

      const rscOptions = temporaryReferences ? { temporaryReferences } : {}
      const rscStream = ReactServer.renderToReadableStream<RscPayload>(
        rscPayload,
        rscOptions,
      )

      // Check if this is an RSC request or HTML request
      const url = new URL(request.url)
      const isRscRequest = url.searchParams.has('__rsc')

      if (isRscRequest) {
        return c.body(rscStream, 200, {
          'content-type': 'text/x-component;charset=utf-8',
          'vary': 'accept',
        })
      }

      // Delegate to SSR for HTML rendering
      const ssrEntryModule = await import.meta.viteRsc.loadModule<
        typeof import('./entry-server.js')
      >('ssr', 'index')
      const htmlStream = await ssrEntryModule.renderHTML(rscStream, {
        formState,
        debugNojs: url.searchParams.has('__nojs'),
      })

      return c.body(htmlStream, 200, {
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
