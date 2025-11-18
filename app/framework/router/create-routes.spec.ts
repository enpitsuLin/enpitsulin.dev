import { describe, expect, it } from 'vitest'
import { createRoutes } from './create-routes'

describe('createRoutes', () => {
  it('should create routes', async () => {
    const router = createRoutes(() => {

    })

    expect(router).toBeDefined()
  })

  it('should create routes with a base path', async () => {
    const router = createRoutes(() => {

    }, { base: '/base' })

    expect(router).toBeDefined()
  })

  it('should not match a empty route', async () => {
    const router = createRoutes(async () => {
    })

    expect(router.match('/')).toBeNull()
  })

  it('should match a static route', async () => {
    const router = createRoutes(async ({ addRoute }) => {
      addRoute('about', { default: 'about' })
    })

    expect(router.match('/about')).not.toBeNull()
  })

  it('should match a static route with a base path', async () => {
    const router = createRoutes(async ({ addRoute }) => {
      addRoute('about', { default: 'about' })
    }, { base: '/base' })

    expect(router.match('/about')).not.toBeNull()
  })
})
