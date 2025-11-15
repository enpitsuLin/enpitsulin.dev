import type { PageComponent } from '@framework/component'
import type { APIHandler, HonoEnv, Method, PageModule } from '@framework/server'
import { createRoutesAsync } from '@framework/router'
import { rscRenderer } from '@framework/rsc/rsc-renderer'
import { Hono } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { logger } from 'hono/logger'
import { createElement } from 'react'
import { parseRenderRequest } from './rsc/request'

const app = new Hono<HonoEnv>()

app.use(rscRenderer({
  getRoot: async () => {
    const { default: Root } = await import('../src/_root')
    return Root
  },
}))
app.use(logger())
app.use(contextStorage())

const modules = import.meta.glob<PageModule>([
  './**/*.{tsx,ts}',
], { base: '../src/pages', exhaustive: true })

app.use(async (c, next) => {
  const router = await createRoutesAsync<PageModule, { type: 'page' | 'api' }>(async ({ addRoute }) => {
    for (let file in modules) {
      const mod = await modules[file]!()

      // strip "./" prefix
      file = file.replace(/^\.\//, '')

      // strip file extension
      file = file.replace(/\.\w+$/, '')

      if (file.startsWith('api/')) {
        // eslint-disable-next-line no-console
        console.log('Registering API route:', file)
        addRoute(file, mod, { type: 'api' })
        continue
      }

      if (file.startsWith('routes/')) {
        const path = file.replace('routes/', '')
        // eslint-disable-next-line no-console
        console.log('Registering API route:', file)
        addRoute(path, mod, { type: 'api' })
        continue
      }

      // eslint-disable-next-line no-console
      console.log('Registering Page route:', file)
      addRoute(file, mod, { type: 'page' })
    }
  })
  c.set('router', router)
  await next()
})

app.all('*', (c) => {
  const renderRequest = parseRenderRequest(c.req.raw)
  const router = c.get('router')
  const route = router.match(renderRequest.url.pathname)

  if (route) {
    if (route.node.value.meta?.type === 'api') {
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
    else {
      const pageNode = route.node

      const component = pageNode.value.module.default as PageComponent
      if (!component) {
        return c.notFound()
      }
      // Store route in context for layout rendering
      c.set('route', route)
      return c.render(createElement(component))
    }
  }

  return c.notFound()
})

export default app
