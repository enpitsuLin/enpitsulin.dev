import type { RouterContext } from '../context'
import { describe, expectTypeOf, it } from 'vitest'
import { Router } from './router'

describe('Router', () => {
  it('inserts routes with correct types', () => {
    type Paths = '/' | 'foo/[id]' | 'foo/[id]/bar' | 'foo/[id]/bar/baz' | 'foo/user/[id]/delete'
    const router = new Router()
      .insert('foo/[id]', { name: 'foo-id' })
      .insert('foo/[id]/bar', { name: 'foo-id-bar' })
      .insert('foo/[id]/bar/baz', { name: 'foo-id-bar-baz' })
      .insert('foo/user/[id]/delete', { name: 'foo-user-delete' })

    expectTypeOf(router)
      .toExtend<Router<RouterContext, Paths>>()
  })
})
