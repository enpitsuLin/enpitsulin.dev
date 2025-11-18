import { describe, expect, it } from 'vitest'
import { TreeNode } from './core/tree'
import { match } from './matcher'

describe('matcher', () => {
  describe('static paths', () => {
    it('should match a simple static path', () => {
      const tree = new TreeNode('/')
      tree.insert('about', { default: 'about' })

      const result = match('/about', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'about' })
      expect(result!.params).toEqual({})
      expect(result!.matchedPath).toBe('/about')
    })

    it('should match nested static paths', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/post', { default: 'post' })

      const result = match('/blog/post', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'post' })
      expect(result!.matchedPath).toBe('/blog/post')
    })

    it('should not match non-existent path', () => {
      const tree = new TreeNode('/')
      tree.insert('about', { default: 'about' })

      const result = match('/contact', tree)
      expect(result).toBeNull()
    })

    it('should not match no-module node', () => {
      const tree = new TreeNode('/')

      expect(match('/', tree)).toBeNull()
    })
  })

  describe('parameter paths', () => {
    it('should match a path with a single param', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/[id]', { default: 'blog-post' })

      const result = match('/blog/123', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'blog-post' })
      expect(result!.params).toEqual({ id: '123' })
      expect(result!.matchedPath).toBe('/blog/:id')
    })

    it('should match a path with multiple params', () => {
      const tree = new TreeNode('/')
      tree.insert('users/[userId]/posts/[postId]', { default: 'post' })

      const result = match('/users/123/posts/456', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ userId: '123', postId: '456' })
    })

    it('should match nested params', () => {
      const tree = new TreeNode('/')
      tree.insert('[category]/[id]', { default: 'item' })

      const result = match('/blog/123', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ category: 'blog', id: '123' })
    })
  })

  describe('optional parameters', () => {
    it('should match optional param when provided', () => {
      const tree = new TreeNode('/')
      tree.insert('posts/[[page]]', { default: 'posts' })

      const result = match('/posts/2', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ page: '2' })
    })

    it('should match optional param when not provided', () => {
      const tree = new TreeNode('/')
      tree.insert('posts/[[page]]', { default: 'posts' })

      const result = match('/posts', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ page: undefined })
    })
  })

  describe('catch-all parameters', () => {
    it('should match catch-all param with multiple segments', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/[...slug]', { default: 'blog' })

      const result = match('/blog/2024/01/hello-world', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ slug: ['2024', '01', 'hello-world'] })
    })

    it('should match catch-all param with single segment', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/[...slug]', { default: 'blog' })

      const result = match('/blog/hello', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ slug: ['hello'] })
    })

    it('should match catch-all param with no segments', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/[...slug]', { default: 'blog' })

      const result = match('/blog', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ slug: undefined })
    })
  })

  describe('group nodes', () => {
    it('should match paths through group nodes', () => {
      const tree = new TreeNode('/')
      tree.insert('(blog)/about', { default: 'about' })

      const result = match('/about', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'about' })
      expect(result!.matchedPath).toBe('/about')
    })

    it('should match nested paths through group nodes', () => {
      const tree = new TreeNode('/')
      tree.insert('(blog)/posts/[id]', { default: 'post' })

      const result = match('/posts/123', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ id: '123' })
    })
  })

  describe('index routes', () => {
    it('should match root path with index child', () => {
      const tree = new TreeNode('/')
      tree.insert('index', { default: 'home' })

      const result = match('/', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'home' })
      expect(result!.matchedPath).toBe('/')
    })

    it('should match nested index routes', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/index', { default: 'blog-index' })

      const result = match('/blog', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'blog-index' })
    })

    it('should match explicit index path', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/index', { default: 'blog-index' })

      const result = match('/blog/index', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'blog-index' })
    })

    it('should match grouped index routes', () => {
      const tree = new TreeNode('/')
      tree.insert('(blog)/index', { default: 'blog-index' })

      const result = match('/', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'blog-index' })
    })
  })

  describe('matching priority', () => {
    it('should prefer static over param match', () => {
      const tree = new TreeNode('/')
      tree.insert('blog', { default: 'blog-static' })
      tree.insert('[slug]', { default: 'slug-param' })

      const result = match('/blog', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'blog-static' })
    })

    it('should prefer fewer params when multiple matches', () => {
      const tree = new TreeNode('/')
      tree.insert('[a]/[b]', { default: 'two-params' })
      tree.insert('[id]', { default: 'one-param' })

      const result = match('/123', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'one-param' })
      expect(result!.params).toEqual({ id: '123' })
    })
  })

  describe('edge cases', () => {
    it('should handle root path with module', () => {
      const tree = new TreeNode('/')
      tree.value.module = { default: 'root' }

      const result = match('/', tree)
      expect(result).not.toBeNull()
      expect(result!.node).toBe(tree)
      expect(result!.params).toEqual({})
    })

    it('should handle empty path as root', () => {
      const tree = new TreeNode('/')
      tree.insert('index', { default: 'home' })

      const result = match('', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'home' })
    })

    it('should handle path with trailing slash', () => {
      const tree = new TreeNode('/')
      tree.insert('about', { default: 'about' })

      const result = match('/about/', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'about' })
    })

    it('should handle path with leading slash', () => {
      const tree = new TreeNode('/')
      tree.insert('about', { default: 'about' })

      const result = match('about', tree)
      expect(result).not.toBeNull()
      expect(result!.node.value.module).toMatchObject({ default: 'about' })
    })
  })

  describe('complex scenarios', () => {
    it('should match complex nested route with params and groups', () => {
      const tree = new TreeNode('/')
      tree.insert('(blog)/posts/[id]/comments', { default: 'comments' })

      const result = match('/posts/123/comments', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({ id: '123' })
      expect(result!.matchedPath).toBe('/posts/:id/comments')
    })

    it('should match route with optional param in middle', () => {
      const tree = new TreeNode('/')
      tree.insert('posts/[[page]]/detail', { default: 'detail' })

      const result1 = match('/posts/2/detail', tree)
      expect(result1).not.toBeNull()
      expect(result1!.params).toEqual({ page: '2' })

      const result2 = match('/posts/detail', tree)
      expect(result2).not.toBeNull()
      expect(result2!.params).toEqual({ page: undefined })
    })

    it('should match catch-all with other params', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/[category]/[...slug]', { default: 'blog' })

      const result = match('/blog/tech/2024/01/hello', tree)
      expect(result).not.toBeNull()
      expect(result!.params).toEqual({
        category: 'tech',
        slug: ['2024', '01', 'hello'],
      })
    })
  })

  describe('no match scenarios', () => {
    it('should return null for non-existent path', () => {
      const tree = new TreeNode('/')
      tree.insert('about', { default: 'about' })

      const result = match('/contact', tree)
      expect(result).toBeNull()
    })

    it('should return null for path that does not complete', () => {
      const tree = new TreeNode('/')
      tree.insert('blog/post', { default: 'post' })

      const result = match('/blog', tree)
      expect(result).toBeNull()
    })

    it('should return null for root when no module or index', () => {
      const tree = new TreeNode('/')

      const result = match('/', tree)
      expect(result).toBeNull()
    })
  })
})
