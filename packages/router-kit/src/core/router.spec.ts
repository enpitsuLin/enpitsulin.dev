import type { MatchResult } from 'path-to-regexp'
import { describe, expect, it } from 'vitest'
import { InsertableRouter, Router } from './router'

describe('Router', () => {
  it('requires routes', () => {
    // @ts-expect-error missing argument
    expect(() => new Router()).toThrow(/Invalid routes/)
    // @ts-expect-error wrong argument
    expect(() => new Router(12)).toThrow(/Invalid routes/)
    // @ts-expect-error wrong argument
    expect(() => new Router(null)).toThrow(/Invalid routes/)
  })

  it('traverses routes', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        { path: '/foo', name: 'foo' },
        {
          path: '/bar',
          name: 'bar',
          children: [
            { path: '/baz', name: 'baz' },
            { path: '/qux', name: 'qux' },
          ],
        },
      ],
    })

    const routes = router.traverse()
    expect(routes.next()).toEqual({
      done: false,
      value: expect.objectContaining({ path: '/', name: 'root' }),
    })
    expect(routes.next()).toEqual({
      done: false,
      value: expect.objectContaining({ path: '/foo', name: 'foo' }),
    })
    expect(routes.next()).toEqual({
      done: false,
      value: expect.objectContaining({ path: '/bar', name: 'bar' }),
    })
    expect(routes.next()).toEqual({
      done: false,
      value: expect.objectContaining({ path: '/baz', name: 'baz' }),
    })
    expect(routes.next()).toEqual({
      done: false,
      value: expect.objectContaining({ path: '/qux', name: 'qux' }),
    })
    expect(routes.next()).toEqual({
      done: true,
      value: undefined,
    })

    const routesArray = [...router]
    expect(routesArray).toEqual([
      expect.objectContaining({ path: '/', name: 'root' }),
      expect.objectContaining({ path: '/foo', name: 'foo' }),
      expect.objectContaining({ path: '/bar', name: 'bar' }),
      expect.objectContaining({ path: '/baz', name: 'baz' }),
      expect.objectContaining({ path: '/qux', name: 'qux' }),
    ])
  })

  it('resolves routes', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        { path: '/foo', name: 'foo' },
        { path: '/bar/:id', name: 'bar-id' },
        { path: '/baz/*splat', name: 'baz-wildcard' },
        { path: '/qux{/:id}', name: 'qux-optional' },
      ],
    } as const)

    expect(router.resolve('/foo')).toEqual(
      expect.objectContaining({
        pathname: '/foo',
        route: expect.objectContaining({
          path: '/foo',
          name: 'foo',
        }),
      }),
    )

    expect(router.resolve('/bar/123')).toEqual(
      expect.objectContaining({
        pathname: '/bar/123',
        params: {
          id: '123',
        },
        route: expect.objectContaining({
          path: '/bar/:id',
          name: 'bar-id',
        }),
      }),
    )

    expect(router.resolve('/baz/123')).toEqual(
      expect.objectContaining({
        pathname: '/baz/123',
        params: {
          splat: ['123'],
        },
        route: expect.objectContaining({
          path: '/baz/*splat',
          name: 'baz-wildcard',
        }),
      }),
    )

    expect(router.resolve('/baz/123/456')).toEqual(
      expect.objectContaining({
        pathname: '/baz/123/456',
        params: {
          splat: ['123', '456'],
        },
        route: expect.objectContaining({
          path: '/baz/*splat',
          name: 'baz-wildcard',
        }),
      }),
    )

    // Test optional parameter
    expect(router.resolve('/qux')).toEqual(
      expect.objectContaining({
        pathname: '/qux',
        params: {},
        route: expect.objectContaining({
          path: '/qux{/:id}',
          name: 'qux-optional',
        }),
      }),
    )

    expect(router.resolve('/qux/456')).toEqual(
      expect.objectContaining({
        pathname: '/qux/456',
        params: {
          id: '456',
        },
        route: expect.objectContaining({
          path: '/qux{/:id}',
          name: 'qux-optional',
        }),
      }),
    )
  })

  it('resolves nested routes', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        {
          path: '/blog',
          name: 'blog',
          children: [
            { path: '/post/:slug', name: 'blog-post' },
            { path: '/category/:name', name: 'blog-category' },
          ],
        },
        {
          path: '/user',
          name: 'user',
          children: [
            { path: '/:id', name: 'user-profile' },
            { path: '/:id/settings', name: 'user-settings' },
          ],
        },
      ],
    })

    expect(router.resolve('/blog/post/hello-world')).toEqual(
      expect.objectContaining({
        pathname: '/post/hello-world',
        baseUrl: '/blog',
        params: {
          slug: 'hello-world',
        },
        route: expect.objectContaining({
          path: '/post/:slug',
          name: 'blog-post',
        }),
      }),
    )

    expect(router.resolve('/user/123/settings')).toEqual(
      expect.objectContaining({
        pathname: '/123/settings',
        baseUrl: '/user',
        params: {
          id: '123',
        },
        route: expect.objectContaining({
          path: '/:id/settings',
          name: 'user-settings',
        }),
      }),
    )
  })

  it('throws 404 error for non-existent routes', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        { path: '/foo', name: 'foo' },
      ],
    })

    expect(() => router.resolve('/bar')).toThrow('Route not found')
    expect(() => router.resolve('/bar')).toThrow(
      expect.objectContaining({ status: 404 }),
    )
  })

  it('handles baseUrl correctly', () => {
    const router = new Router(
      {
        path: '/',
        name: 'root',
        children: [
          { path: '/foo', name: 'foo' },
          { path: '/bar/:id', name: 'bar' },
        ],
      },
      '/app',
    )

    expect(router.baseUrl).toBe('/app')

    // Should match with baseUrl prefix
    expect(router.resolve('/app/foo')).toEqual(
      expect.objectContaining({
        pathname: '/foo',
        baseUrl: '/app',
        route: expect.objectContaining({
          path: '/foo',
          name: 'foo',
        }),
      }),
    )

    // Should also match without baseUrl prefix
    expect(router.resolve('/bar/123')).toEqual(
      expect.objectContaining({
        pathname: '/bar/123',
        params: {
          id: '123',
        },
      }),
    )
  })

  it('supports routes array as constructor argument', () => {
    const router = new Router([
      { path: '/foo', name: 'foo' },
      { path: '/bar', name: 'bar' },
    ])

    expect(router.root).toEqual(
      expect.objectContaining({
        path: '',
        children: expect.arrayContaining([
          expect.objectContaining({ path: '/foo', name: 'foo' }),
          expect.objectContaining({ path: '/bar', name: 'bar' }),
        ]),
      }),
    )

    expect(router.resolve('/foo')).toEqual(
      expect.objectContaining({
        route: expect.objectContaining({
          path: '/foo',
          name: 'foo',
        }),
      }),
    )
  })

  it('supports custom match function', () => {
    const customMatch = (pathname: string) => {
      if (pathname === '/custom') {
        return { path: '/custom', params: { custom: true }, index: 0 } as MatchResult<any>
      }
      return false
    }

    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        { path: '/custom', name: 'custom', match: customMatch },
      ],
    })

    expect(router.resolve('/custom')).toEqual(
      expect.objectContaining({
        pathname: '/custom',
        params: {
          custom: true,
        },
        route: expect.objectContaining({
          name: 'custom',
        }),
      }),
    )
  })

  it('handles deeply nested routes', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        {
          path: '/a',
          name: 'a',
          children: [
            {
              path: '/b',
              name: 'b',
              children: [
                {
                  path: '/c',
                  name: 'c',
                  children: [
                    { path: '/d', name: 'd' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    expect(router.resolve('/a/b/c/d')).toEqual(
      expect.objectContaining({
        pathname: '/d',
        baseUrl: '/a/b/c',
        route: expect.objectContaining({
          path: '/d',
          name: 'd',
        }),
      }),
    )
  })

  it('returns parent route if no children match', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        {
          path: '/parent',
          name: 'parent',
          children: [
            { path: '/child', name: 'child' },
          ],
        },
      ],
    })

    // Should match parent route when path is exactly '/parent'
    expect(router.resolve('/parent')).toEqual(
      expect.objectContaining({
        pathname: '/parent',
        route: expect.objectContaining({
          path: '/parent',
          name: 'parent',
        }),
      }),
    )
  })

  it('handles multiple dynamic segments', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        { path: '/:org/:repo/issues/:number', name: 'issue' },
      ],
    })

    expect(router.resolve('/facebook/react/issues/123')).toEqual(
      expect.objectContaining({
        pathname: '/facebook/react/issues/123',
        params: {
          org: 'facebook',
          repo: 'react',
          number: '123',
        },
        route: expect.objectContaining({
          name: 'issue',
        }),
      }),
    )
  })

  it('handles root route without children', () => {
    const router = new Router({
      path: '/',
      name: 'root',
    })

    expect(router.resolve('/')).toEqual(
      expect.objectContaining({
        pathname: '/',
        route: expect.objectContaining({
          path: '/',
          name: 'root',
        }),
      }),
    )
  })

  it('matches first matching route in order', () => {
    const router = new Router({
      path: '/',
      name: 'root',
      children: [
        { path: '/:id', name: 'dynamic' },
        { path: '/static', name: 'static' },
      ],
    })

    // Should match the first route (dynamic) because it comes first
    expect(router.resolve('/static')).toEqual(
      expect.objectContaining({
        params: {
          id: 'static',
        },
        route: expect.objectContaining({
          name: 'dynamic',
        }),
      }),
    )
  })
})

describe('InsertableRouter', () => {
  it('inserts routes base', () => {
    const router = new InsertableRouter()
      .insert('/foo', { name: 'foo' })

    const routes = Array.from(router)
    expect(routes.map(route => route.path)).toEqual(['/', '/foo'])
  })

  it('inserts routes nested', () => {
    const router = new InsertableRouter()
      .insert('foo', { name: 'foo' })
      .insert('foo/bar', { name: 'foo-bar' })
      .insert('foo/bar/baz', { name: 'foo-bar-baz' })

    const routes = Array.from(router)
    expect(routes.map(route => route.path)).toEqual(['/', '/foo', '/foo/bar', '/foo/bar/baz'])
  })

  it('inserts routes with dynamic segments', () => {
    const router = new InsertableRouter()
      .insert('foo/:id', { name: 'foo-id' })
      .insert('foo/:id/bar', { name: 'foo-id-bar' })
      .insert('foo/:id/bar/baz', { name: 'foo-id-bar-baz' })
      .insert('foo/user{/:id}/delete', { name: 'foo-user-delete' })

    const routes = Array.from(router)
    expect(routes).toEqual([
      expect.objectContaining({ path: '/' }),
      expect.objectContaining({ path: '/foo' }),
      expect.objectContaining({ path: '/foo/:id' }),
      expect.objectContaining({ path: '/foo/:id/bar' }),
      expect.objectContaining({ path: '/foo/:id/bar/baz' }),
      expect.objectContaining({ path: '/foo/user{/:id}' }),
      expect.objectContaining({ path: '/foo/user{/:id}/delete' }),
    ])
  })
})
