/* eslint-disable ts/no-empty-object-type */
import type { AccpetRoutePath, ExtractRouteParams, FlattenNodePaths } from './type'
import { describe, expectTypeOf, it } from 'vitest'

describe('ExtractRouteParams', () => {
  it('extracts single dynamic parameter', () => {
    type Result = ExtractRouteParams<'/user/:id'>
    expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
  })

  it('extracts multiple dynamic parameters', () => {
    type Result = ExtractRouteParams<'/user/:userId/post/:postId'>
    expectTypeOf<Result>().toEqualTypeOf<{ userId: string, postId: string }>()
  })

  it('extracts wildcard parameter', () => {
    type Result = ExtractRouteParams<'/files/*path'>
    expectTypeOf<Result>().toEqualTypeOf<{ path: string[] }>()
  })

  it('extracts optional parameter', () => {
    type Result = ExtractRouteParams<'/user{/:id}'>
    expectTypeOf<Result>().toEqualTypeOf<{ id?: string }>()
  })

  it('extracts mixed parameters', () => {
    type Result = ExtractRouteParams<'/:org/:repo/issues/:number'>
    expectTypeOf<Result>().toEqualTypeOf<{ org: string, repo: string, number: string }>()
  })

  it('returns empty object for routes without parameters', () => {
    type Result = ExtractRouteParams<'/static/path'>
    expectTypeOf<Result>().toEqualTypeOf<{}>()
  })

  it('handles complex paths', () => {
    type Result = ExtractRouteParams<'/api/:version/users/:id/posts/*path'>
    expectTypeOf<Result>().toEqualTypeOf<{ version: string, id: string, path: string[] }>()
  })

  it('handles multiple optional groups', () => {
    type Result = ExtractRouteParams<'/api{/:version}/users/:id/posts/file{.ext}'>
    expectTypeOf<Result>().toEqualTypeOf<{ version?: string, id: string, ext?: string }>()
  })
})

describe('AccpetRoutePath', () => {
  it('accept all path', () => {
    type Result = AccpetRoutePath<string>
    expectTypeOf<Result>().toEqualTypeOf<string>()
  })

  it('keeps static paths unchanged', () => {
    type Result = AccpetRoutePath<'/static/path'>
    expectTypeOf<Result>().toEqualTypeOf<'/static/path'>()
  })

  it('converts dynamic parameter to string template', () => {
    type Result = AccpetRoutePath<'/parent/:name'>
    expectTypeOf<Result>().toEqualTypeOf<`/parent/${string}`>()
  })

  it('converts wildcard parameter', () => {
    type Result = AccpetRoutePath<'/parent/*path'>
    // Should match '/parent' or '/parent/...' with any path segments
    expectTypeOf<'/parent'>().toExtend<Result>()
    expectTypeOf<'/parent/a'>().toExtend<Result>()
    expectTypeOf<'/parent/a/b/c'>().toExtend<Result>()
  })

  it('handles optional groups with dynamic parameter', () => {
    type Result = AccpetRoutePath<'/parent{/:name}/child'>
    // Should match '/parent/child' or '/parent/value/child'
    expectTypeOf<'/parent/child'>().toExtend<Result>()
    expectTypeOf<'/parent/value/child'>().toExtend<Result>()
  })

  it('handles multiple dynamic parameters', () => {
    type Result = AccpetRoutePath<'/user/:userId/post/:postId'>
    expectTypeOf<Result>().toEqualTypeOf<`/user/${string}/post/${string}`>()
  })

  it('handles complex paths with mixed parameters', () => {
    type Result = AccpetRoutePath<'/api/:version/files/*path'>
    // Should match patterns like '/api/v1/files' or '/api/v1/files/a/b/c'
    expectTypeOf<'/api/v1/files'>().toExtend<Result>()
    expectTypeOf<'/api/v1/files/a/b'>().toExtend<Result>()
  })

  it('handles optional extension group', () => {
    type Result = AccpetRoutePath<'/file{.ext}'>
    // Should match '/file' or '/file.json'
    expectTypeOf<'/file'>().toExtend<Result>()
    expectTypeOf<'/file.json'>().toExtend<Result>()
  })
})

describe('FlattenNodePaths', () => {
  it('flattens a tree of nodes into a list of paths', () => {
    type Result = FlattenNodePaths<{
      path: '/'
      children: [
        {
          path: '/foo'
        },
        {
          path: '/bar'
        },
        {
          path: '/baz'
        },
        {
          path: '/qux'
          children: [
            {
              path: '/a'
            },
            {
              path: '/b'
            },
          ]
        },
      ]
    }>

    expectTypeOf<Result>().toEqualTypeOf<'/' | '/foo' | '/bar' | '/baz' | '/qux' | '/qux/a' | '/qux/b'>()
  })
})
