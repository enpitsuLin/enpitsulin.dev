import type { Mock } from 'vitest'
import { describe, expect, it, vi } from 'vitest'
import { createRoutesAsync } from './create-routes'

interface TestModule {
  default?: Mock<() => void> | Mock<(_req: Request) => Promise<Response>>
  GET?: Mock<(_req: Request) => Promise<Response>>
  POST?: Mock<(_req: Request) => Promise<Response>>
  PUT?: Mock<(_req: Request) => Promise<Response>>
  DELETE?: Mock<(_req: Request) => Promise<Response>>
  PATCH?: Mock<(_req: Request) => Promise<Response>>
  HEAD?: Mock<(_req: Request) => Promise<Response>>
  OPTIONS?: Mock<(_req: Request) => Promise<Response>>
  CONNECT?: Mock<(_req: Request) => Promise<Response>>
  TRACE?: Mock<(_req: Request) => Promise<Response>>
}

interface TestMeta {
  type: 'page' | 'api'
}

const MockComponent = vi.fn()
const MockApiHandler = vi.fn((_req: Request) => {
  return Promise.resolve(new Response('Hello World'))
})

const pages: Record<string, () => Promise<TestModule>> = {
  './(blog)/_layout.tsx': () => Promise.resolve({ default: MockComponent }),
  './(blog)/index.tsx': () => Promise.resolve({ default: MockComponent }),
  './(blog)/blog/index.tsx': () => Promise.resolve({ default: MockComponent }),
  './(blog)/blog/[slug].tsx': () => Promise.resolve({ default: MockComponent }),
  './(blog)/projects.tsx': () => Promise.resolve({ default: MockComponent }),
  './(blog)/guestbook.tsx': () => Promise.resolve({ default: MockComponent }),
  './(blog)/about.tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/_layout.tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/sign-in.tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/dashboard.tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/users/[id].tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/posts/[[page]].tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/posts/create.tsx': () => Promise.resolve({ default: MockComponent }),
  './(admin)/posts/[id].tsx': () => Promise.resolve({ default: MockComponent }),
  './[...404].tsx': () => Promise.resolve({ default: MockComponent }),
  './api/hello.ts': () => Promise.resolve({ default: MockApiHandler }),
  './api/foo.ts': () => Promise.resolve({ GET: MockApiHandler }),
  './routes/.well-known/intro.json.ts': () => Promise.resolve({ default: MockApiHandler }),
}

// const pages = import.meta.glob ([
//   './**/*.{tsx,ts}',
// ], { base: '../../src/pages', exhaustive: true })

describe('route usage', () => {
  it('pages should work', () => {
    expect(pages).toBeDefined()

    expect(Object.keys(pages).length).toBeGreaterThan(0)
  })

  it('should register all routes', async () => {
    const router = await createRoutesAsync<TestModule, TestMeta>(async ({ addRoute }) => {
      for (let file in pages) {
        const mod = await pages[file]!()

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

    expect(router).toBeDefined()

    expect(router.match('/')).not.toBeNull()
    expect(router.match('/blog')).not.toBeNull()
    expect(router.match('/blog/my-first-post')).not.toBeNull()
    expect(router.match('/projects')).not.toBeNull()
    expect(router.match('/guestbook')).not.toBeNull()
    expect(router.match('/about')).not.toBeNull()
    expect(router.match('/sign-in')).not.toBeNull()
    expect(router.match('/dashboard')).not.toBeNull()
    expect(router.match('/users/123')).not.toBeNull()
    expect(router.match('/posts')).not.toBeNull()
    expect(router.match('/posts/2')).not.toBeNull()
    expect(router.match('/posts/create')).not.toBeNull()
    expect(router.match('/non-existent-page')).not.toBeNull() // should match [...404].tsx

    const apiHello = router.match('/api/hello')
    expect(apiHello).not.toBeNull()
    expect(apiHello!.node.meta).toEqual({ type: 'api' })

    const apiFoo = router.match('/api/foo')
    expect(apiFoo).not.toBeNull()
    expect(apiFoo!.node.meta).toEqual({ type: 'api' })

    const introJson = router.match('/.well-known/intro.json')
    expect(introJson).not.toBeNull()
    expect(introJson!.node.meta).toEqual({ type: 'api' })
  })
})
