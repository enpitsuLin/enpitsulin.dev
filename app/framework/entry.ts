import type { RootComponent } from '@framework/component'
import type { HonoEnv, PageModule } from '@framework/server'
import { createRoutesAsync } from '@framework/router'
import { rscMiddle } from '@framework/rsc/rsc-middleware'
import { Hono } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { logger } from 'hono/logger'

const app = new Hono<HonoEnv>()

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
  const routes = router.tree.getChildrenDeepSorted()
  c.set('routes', routes)
  await next()
})

app.use(logger())
app.use(contextStorage())
app.use(rscMiddle({
  getRoot: async () => {
    const { default: Root } = await import('../src/_root')
    return Root as RootComponent
  },
}))

export default app
