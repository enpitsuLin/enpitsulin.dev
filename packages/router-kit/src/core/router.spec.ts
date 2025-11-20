import { describe, expect, it } from 'vitest'
import { Router } from './router'

describe('router', () => {
  it('should create a router', () => {
    const router = new Router()
    expect(router.root.children.size).toBe(0)
  })

  it('should insert a route', () => {
    const router = new Router()
    router.insert('foo', { })
    expect(router.routesMap.size).toBe(1)
    expect(router.routesMap.get('/foo')).toBeDefined()

    router.insert('bar', { })
    expect(router.routesMap.size).toBe(2)
    expect(router.routesMap.get('/bar')).toBeDefined()

    router.insert('foo/bar', { })
    expect(router.routesMap.size).toBe(3)
    expect(router.routesMap.get('/foo/bar')).toBeDefined()

    router.insert('bar/[id]', {})
    expect(router.routesMap.size).toBe(4)
    expect(router.routesMap.get('/bar/:id')).toBeDefined()
  })
})
