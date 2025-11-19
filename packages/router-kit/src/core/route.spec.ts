import { describe, expect, it } from 'vitest'
import { Route } from './route'

describe('route', () => {
  it('create an empty route tree with a root node', () => {
    const root = new Route('')

    expect(root.children.size).toBe(0)
    expect(root.path).toBe('')
    expect(root.fullPath).toBe('/')
  })

  it('creates a route tree with a single static path', () => {
    const root = new Route('')
    root.insert('foo', {})
    expect(root.children.size).toBe(1)

    const child = root.children.get('foo')!
    expect(child).toBeDefined()
    expect(child.value.rawSegment).toBe('foo')
    expect(child.value.fullPath).toBe('/foo')
    expect(child.value.isStatic())
  })

  it('creates a route tree with a single param', () => {
    const tree = new Route('')
    tree.insert('[id]', { default: 'id' })

    expect(tree.children.size).toBe(1)
    const child = tree.children.get('[id]')!

    expect(child).toBeDefined()
    expect(child.value.rawSegment).toBe('[id]')
    expect(child.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])
    expect(child.value.fullPath).toBe('/:id')
    expect(child.value.isParam())
  })

  it('creates a route tree with catch-all param', () => {
    const tree = new Route('')
    tree.insert('[...all]', { default: 'all' })
    expect(tree.children.size).toBe(1)
    const child = tree.children.get('[...all]')!

    expect(child).toBeDefined()
    expect(child.value.rawSegment).toBe('[...all]')
    expect(child.params).toEqual([
      {
        isSplat: true,
        modifier: '',
        optional: false,
        paramName: 'all',
        parser: null,
        repeatable: false,
      },
    ])
    expect(child.value.fullPath).toBe('/:all(.*)')
    expect(child.value.isParam())
  })

  it('creates a route tree with params in nested route', () => {
    const tree = new Route('')
    const nestedId = tree.insert('nested/[id]', { default: 'nested' })

    expect(nestedId.value.rawSegment).toBe('[id]')
    expect(nestedId.value.isParam()).toBe(true)
    expect(nestedId.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])

    const nestedAId = tree.insert('nested/a/[id]', { default: 'nested/a' })
    expect(nestedAId.value.rawSegment).toBe('[id]')
    expect(nestedAId.value.isParam()).toBe(true)
    expect(nestedAId.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])
  })

  it('creates a route tree with params in nested parent path', () => {
    const tree = new Route('')

    let node = tree.insert('nested/[id]/index', { default: 'nested/[id]/index' })
    const id = tree.children.get('nested')!.children.get('[id]')!

    expect(id.value.rawSegment).toBe('[id]')
    expect(id.value.isParam()).toBe(true)
    expect(id.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])

    expect(node.value.rawSegment).toBe('index')
    expect(node.value.isParam()).toBe(false)
    expect(node.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])

    node = tree.insert('nested/[a]/other', { default: 'nested/[a]/other' })
    expect(node.value.rawSegment).toBe('other')
    expect(node.value.isParam()).toBe(false)
    expect(node.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'a',
        parser: null,
        repeatable: false,
      },
    ])

    node = tree.insert('nested/a/[id]/index', { default: 'nested/a/[id]/index' })
    expect(node.value.rawSegment).toBe('index')
    expect(node.value.isParam()).toBe(false)
    expect(node.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])
  })

  it('creates a route tree with optional params path', () => {
    const tree = new Route('')
    tree.insert('[[id]]', { default: '[[id]]' })
    const node = tree.children.get('[[id]]')!
    expect(node.value.rawSegment).toBe('[[id]]')
    expect(node.params).toEqual([
      {
        isSplat: false,
        modifier: '?',
        optional: true,
        paramName: 'id',
        parser: null,
        repeatable: false,
      },
    ])

    expect(node.value.fullPath).toBe('/:id?')
  })

  it('creates a route tree with groups paths', () => {
    const tree = new Route('/')
    tree.insert('(home)', { default: 'home' })
    const child = tree.children.get('(home)')!

    expect(child.value.rawSegment).toBe('(home)')
    expect(child.value.fullPath).toBe('/')

    expect(child).toBeDefined()
    expect(child.path).toBe('/')
    expect(child.fullPath).toBe('/')
  })
})

describe('advanced route tree creation', () => {
  interface TestContext {}

  const root = new Route<TestContext>('')

  function getTreeNodeModule(node: Route<TestContext>) {
    return node.value.views.get('default')!
  }

  const routes: Record<string, TestContext> = {
    'pages/(blog)/_layout': { default: '/(blog)/_layout' },
    'pages/(blog)/index': { default: '/(blog)/index' },
    'pages/(blog)/blog/index': { default: '/(blog)/blog/index' },
    'pages/(blog)/blog/[slug]': { default: '/(blog)/blog/[slug]' },
    'pages/(blog)/projects': { default: '/(blog)/projects' },
    'pages/(blog)/guestbook': { default: '/(blog)/guestbook' },
    'pages/(blog)/about': { default: '/(blog)/about' },
    'pages/(admin)/_layout': { default: '/(admin)/_layout' },
    'pages/(admin)/sign-in': { default: '/(admin)/sign-in' },
    'pages/(admin)/dashboard': { default: '/(admin)/dashboard' },
    'pages/(admin)/users': { default: '/(admin)/users' },
    'pages/(admin)/users/[id]': { default: '/(admin)/users/[id]' },
    'pages/(admin)/posts/[[page]]': { default: '/(admin)/posts/[[page]]' },
    'pages/(admin)/posts/create': { default: '/(admin)/posts/create' },
    'pages/(admin)/posts/[id]': { default: '/(admin)/posts/[id]' },
  }

  for (const [path, module] of Object.entries(routes)) {
    root.insert(path, module)
  }

  it('creates both groups', () => {
    const pages = root.children.get('pages')!

    expect(pages.children.size).toBe(2)
    expect(pages.children.has('(blog)')).toBe(true)
    expect(pages.children.has('(admin)')).toBe(true)
  })

  it('creates (blog)/pages node properly', async () => {
    const pages = root.children.get('pages')!

    const blogGroup = pages.children.get('(blog)')!

    const blog = blogGroup.children.get('blog')!
    expect(getTreeNodeModule(blog.children.get('index')!))
      .toMatchObject({ default: '/(blog)/blog/index' })
    expect(getTreeNodeModule(blog.children.get('[slug]')!))
      .toMatchObject({ default: '/(blog)/blog/[slug]' })
    expect(blog.children.get('[slug]')!.params).toEqual([
      {
        isSplat: false,
        modifier: '',
        optional: false,
        paramName: 'slug',
        parser: null,
        repeatable: false,
      },
    ])

    const guestbook = blogGroup.children.get('guestbook')!
    expect(getTreeNodeModule(guestbook))
      .toMatchObject({ default: '/(blog)/guestbook' })

    const projects = blogGroup.children.get('projects')!
    expect(getTreeNodeModule(projects))
      .toMatchObject({ default: '/(blog)/projects' })

    const about = blogGroup.children.get('about')!
    expect(getTreeNodeModule(about))
      .toMatchObject({ default: '/(blog)/about' })
  })
})
