import { describe, expect, it } from 'vitest'
import { TreeNode } from './tree'

describe('tree', () => {
  it('creates an empty tree with a root node', () => {
    const tree = new TreeNode('/')
    expect(tree.children.size).toBe(0)
    expect(tree.path).toBe('/')
    expect(tree.fullPath).toBe('/')
  })

  it('creates a tree with a single static path', () => {
    const tree = new TreeNode('/')
    tree.insert('foo', { default: 'foo' })

    expect(tree.children.size).toBe(1)
    const child = tree.children.get('foo')!
    expect(child).toBeDefined()
    expect(child.value.rawSegment).toBe('foo')
    expect(child.value.fullPath).toBe('/foo')
    expect(child.value.type).toBe('static')
    expect(child.value.module).toMatchObject({ default: 'foo' })
  })

  it('creates a tree with a single param', () => {
    const tree = new TreeNode('/')
    tree.insert('[id]', { default: 'id' })

    expect(tree.children.size).toBe(1)
    const child = tree.children.get('[id]')!

    expect(child).toBeDefined()
    expect(child.value.rawSegment).toBe('[id]')
    expect(child.value.params).toEqual([
      expect.objectContaining({
        paramName: 'id',
        optional: false,
        catchAll: false,
      }),
    ])
    expect(child.value.fullPath).toBe('/:id')
    expect(child.value.type).toBe('param')
  })

  it('creates a tree with catch-all param', () => {
    const tree = new TreeNode('/')
    tree.insert('[...all]', { default: 'all' })
    expect(tree.children.size).toBe(1)
    const child = tree.children.get('[...all]')!

    expect(child).toBeDefined()
    expect(child.value.rawSegment).toBe('[...all]')
    expect(child.value.params).toEqual([
      expect.objectContaining({
        paramName: 'all',
        optional: false,
        catchAll: true,
      }),
    ])
    expect(child.value.fullPath).toBe('/*all')
    expect(child.value.type).toBe('param')
  })

  it('creates params in nested route', () => {
    const tree = new TreeNode('/')
    const nestedId = tree.insert('nested/[id]', { default: 'nested' })

    expect(nestedId.value.rawSegment).toBe('[id]')
    expect(nestedId.value.isParam()).toBe(true)
    expect(nestedId.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
        catchAll: false,
      }),
    ])

    const nestedAId = tree.insert('nested/a/[id]', { default: 'nested/a' })
    expect(nestedAId.value.rawSegment).toBe('[id]')
    expect(nestedAId.value.isParam()).toBe(true)
    expect(nestedAId.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
        catchAll: false,
      }),
    ])
  })

  it('creates params in nested parent path', () => {
    const tree = new TreeNode('/')

    let node = tree.insert('nested/[id]/index', { default: 'nested/[id]/index' })
    const id = tree.children.get('nested')!.children.get('[id]')!

    expect(id.value.rawSegment).toBe('[id]')
    expect(id.value.isParam()).toBe(true)
    expect(id.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
        catchAll: false,
      }),
    ])

    expect(node.value.rawSegment).toBe('index')
    expect(node.value.isParam()).toBe(false)
    expect(node.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
        catchAll: false,
      }),
    ])

    node = tree.insert('nested/[a]/other', { default: 'nested/[a]/other' })
    expect(node.value.rawSegment).toBe('other')
    expect(node.value.isParam()).toBe(false)
    expect(node.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'a',
        catchAll: false,
      }),
    ])

    node = tree.insert('nested/a/[id]/index', { default: 'nested/a/[id]/index' })
    expect(node.value.rawSegment).toBe('index')
    expect(node.value.isParam()).toBe(false)
    expect(node.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
        catchAll: false,
      }),
    ])
  })

  it('handles optional params', () => {
    const tree = new TreeNode('/')
    tree.insert('[[id]]', { default: '[[id]]' })
    const node = tree.children.get('[[id]]')!
    expect(node.value.rawSegment).toBe('[[id]]')
    expect(node.params).toEqual([
      expect.objectContaining({
        optional: true,
        paramName: 'id',
        catchAll: false,
      }),
    ])

    expect(node.value.fullPath).toBe('/:id?')
  })

  it('strips groups from file paths', () => {
    const tree = new TreeNode('/')
    tree.insert('(home)', { default: 'home' })
    const child = tree.children.get('(home)')!

    expect(child.value.rawSegment).toBe('(home)')
    expect(child.value.fullPath).toBe('/')

    expect(child).toBeDefined()
    expect(child.path).toBe('/')
    expect(child.fullPath).toBe('/')
  })

  it('creates a tree with a layout', () => {
    const tree = new TreeNode('/')
    const layoutNode = tree.insert('_layout', { default: 'layout' })

    expect(tree.layout).toBeDefined()
    expect(tree.layout).toBe(layoutNode)
    expect(tree.layout!.value.module).toMatchObject({ default: 'layout' })
    expect(tree.layout!.path).toBe('/_layout')
    expect(tree.layout!.fullPath).toBe('/_layout')
  })

  it('creates a tree with layouts in multiple levels', () => {
    const tree = new TreeNode('/')
    tree.insert('_layout', { default: 'root layout' })

    tree.insert('about/_layout', { default: 'about layout' })
    tree.insert('about/index', { default: 'about index' })

    expect(tree.layout).toBeDefined()
    expect(tree.layout!.value.module).toMatchObject({ default: 'root layout' })

    const about = tree.children.get('about')!
    expect(about.layout).toBeDefined()
    expect(about.layout!.value.module).toMatchObject({ default: 'about layout' })
  })
})

describe('advanced tree creation', () => {
  type TestModule = () => Promise<{ default: string }>

  function getTreeNodeModule(node: TreeNode<TestModule>) {
    return node.value.module!()
  }

  const tree = new TreeNode<TestModule>('/')
  const routes: Record<string, TestModule> = {
    'pages/(blog)/_layout': () => Promise.resolve({ default: '/(blog)/_layout' }),
    'pages/(blog)/index': () => Promise.resolve({ default: '/(blog)/index' }),
    'pages/(blog)/blog/index': () => Promise.resolve({ default: '/(blog)/blog/index' }),
    'pages/(blog)/blog/[slug]': () => Promise.resolve({ default: '/(blog)/blog/[slug]' }),
    'pages/(blog)/projects': () => Promise.resolve({ default: '/(blog)/projects' }),
    'pages/(blog)/guestbook': () => Promise.resolve({ default: '/(blog)/guestbook' }),
    'pages/(blog)/about': () => Promise.resolve({ default: '/(blog)/about' }),
    'pages/(admin)/_layout': () => Promise.resolve({ default: '/(admin)/_layout' }),
    'pages/(admin)/sign-in': () => Promise.resolve({ default: '/(admin)/sign-in' }),
    'pages/(admin)/dashboard': () => Promise.resolve({ default: '/(admin)/dashboard' }),
    'pages/(admin)/users': () => Promise.resolve({ default: '/(admin)/users' }),
    'pages/(admin)/users/[id]': () => Promise.resolve({ default: '/(admin)/users/[id]' }),
    'pages/(admin)/posts/[[page]]': () => Promise.resolve({ default: '/(admin)/posts/[[page]]' }),
    'pages/(admin)/posts/create': () => Promise.resolve({ default: '/(admin)/posts/create' }),
    'pages/(admin)/posts/[id]': () => Promise.resolve({ default: '/(admin)/posts/[id]' }),
  }

  for (const [path, module] of Object.entries(routes)) {
    tree.insert(path, module)
  }

  it('creates both groups', () => {
    const pages = tree.children.get('pages')!

    expect(pages.children.size).toBe(2)
    expect(pages.children.has('(blog)')).toBe(true)
    expect(pages.children.has('(admin)')).toBe(true)
  })

  it('creates (blog)/pages node properly', async () => {
    const pages = tree.children.get('pages')!

    const blogGroup = pages.children.get('(blog)')!

    const blog = blogGroup.children.get('blog')!
    expect(await getTreeNodeModule(blog.children.get('index')!)).toMatchObject({ default: '/(blog)/blog/index' })
    expect(await getTreeNodeModule(blog.children.get('[slug]')!)).toMatchObject({ default: '/(blog)/blog/[slug]' })
    expect(blog.children.get('[slug]')!.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'slug',
      }),
    ])

    const guestbook = blogGroup.children.get('guestbook')!
    expect(await getTreeNodeModule(guestbook)).toMatchObject({ default: '/(blog)/guestbook' })

    const projects = blogGroup.children.get('projects')!
    expect(await getTreeNodeModule(projects)).toMatchObject({ default: '/(blog)/projects' })

    const about = blogGroup.children.get('about')!
    expect(await getTreeNodeModule(about)).toMatchObject({ default: '/(blog)/about' })
  })

  it('creates (admin)/pages node properly', async () => {
    const pages = tree.children.get('pages')!

    const adminGroup = pages.children.get('(admin)')!

    const signIn = adminGroup.children.get('sign-in')!
    expect(await getTreeNodeModule(signIn)).toMatchObject({ default: '/(admin)/sign-in' })

    const dashboard = adminGroup.children.get('dashboard')!
    expect(await getTreeNodeModule(dashboard)).toMatchObject({ default: '/(admin)/dashboard' })

    const users = adminGroup.children.get('users')!
    expect(await getTreeNodeModule(users)).toMatchObject({ default: '/(admin)/users' })
    expect(await getTreeNodeModule(users.children.get('[id]')!)).toMatchObject({ default: '/(admin)/users/[id]' })
    expect(users.children.get('[id]')!.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
      }),
    ])

    const posts = adminGroup.children.get('posts')!
    expect(await getTreeNodeModule(posts.children.get('create')!)).toMatchObject({ default: '/(admin)/posts/create' })
    expect(await getTreeNodeModule(posts.children.get('[id]')!)).toMatchObject({ default: '/(admin)/posts/[id]' })
    expect(posts.children.get('[id]')!.params).toEqual([
      expect.objectContaining({
        optional: false,
        paramName: 'id',
      }),
    ])
    expect(await getTreeNodeModule(posts.children.get('[[page]]')!))
      .toMatchObject({ default: '/(admin)/posts/[[page]]' })
    expect(posts.children.get('[[page]]')!.params).toEqual([
      expect.objectContaining({
        optional: true,
        paramName: 'page',
      }),
    ])
  })
})
