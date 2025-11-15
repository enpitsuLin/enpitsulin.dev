import type { PageComponent } from '@framework/component'
import type { HonoEnv, Method, PageModule } from '@framework/server'
import { createRoutesAsync } from '@framework/router'
import { rscRenderer } from '@framework/rsc/rsc-renderer'
import { Hono } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { logger } from 'hono/logger'
import { createElement } from 'react'

const app = new Hono<HonoEnv>()

app.use(rscRenderer())
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
        addRoute(file, mod, { type: 'api' })
        continue
      }

      if (file.startsWith('routes/')) {
        const path = file.replace('routes/', '')
        addRoute(path, mod, { type: 'api' })
        continue
      }

      addRoute(file, mod, { type: 'page' })
    }
  })
  c.set('router', router)
  await next()
})

app.all('*', (c) => {
  const url = new URL(c.req.url)
  const router = c.get('router')
  const route = router.match(url.pathname)

  if (route) {
    if (route.node.value.meta?.type === 'api') {
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
