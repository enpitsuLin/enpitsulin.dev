import type { VueHeadClient } from '@unhead/vue/client'
import type { H3Event } from 'h3'
import type { Hookable } from 'hookable'
import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'
import type { SSRContext } from 'vue/server-renderer'

export interface RuntimeHooks {
  'app:created': (app: App<Element>) => Promise<void> | void
  'app:beforeMount': (app: App<Element>) => Promise<void> | void
  'app:mounted': (app: App<Element>) => Promise<void> | void
  'app:rendered': (ctx: AppRenderedContext) => Promise<void> | void
}

export interface AppInitialState {
  [key: string]: unknown
}

export interface AppContext {
  app: App<Element>
  router: Router
  routes: Readonly<RouteRecordRaw[]>
  initialState: AppInitialState
  head: VueHeadClient
  hooks: Hookable<RuntimeHooks>
  /**
   * Current router path on SSR, `undefined` on client side.
   */
  routePath?: string
}
export type UserModule = (ctx: AppContext) => void

interface AppRenderedContext {
  ssrContext: AppSSRContext
  renderResult: string
}

export interface AppSSRContext extends SSRContext {
  event: H3Event<Request>
  modules: Set<string>
  cloudflare: {
    env: Cloudflare.Env
    ctx: ExecutionContext
  }
  url: string
}
