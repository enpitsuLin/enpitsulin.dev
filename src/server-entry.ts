/// <reference types="vite/client" />
import { contextStorage } from 'hono/context-storage'
import { fsRouter } from 'waku'
import adapter from 'waku/adapters/cloudflare'
import cloudflareMiddleware from './middleware/cloudflare'

export default adapter(
  fsRouter(
    import.meta.glob('./**/*.{tsx,ts}', { base: './pages', exhaustive: true }),
  ),
  { middlewareFns: [contextStorage, cloudflareMiddleware] },
)
