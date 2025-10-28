import type { VueHeadClient } from '@unhead/vue/client'
import type { H3Event } from 'h3'
import type { Hookable } from 'hookable'
import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'
import type { SSRContext } from 'vue/server-renderer'

export interface AppContext {
  app: App<Element>
  router: Router
  routes: Readonly<RouteRecordRaw[]>
  initialState: Record<string, any>
  head: VueHeadClient
  hooks: Hookable<{
    'app:before-render': (path: string) => void
    'app:after-render': (path: string, appHTML: string) => void
  }>
  /**
   * Current router path on SSR, `undefined` on client side.
   */
  routePath?: string
}
export type UserModule = (ctx: AppContext) => void

export interface AppSSRContext extends SSRContext {
  event: H3Event<Request>
  modules: Set<string>
  cloudflare: {
    env: Cloudflare.Env
    ctx: ExecutionContext
  }
  url: string
}
