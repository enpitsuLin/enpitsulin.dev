import type { VueHeadClient } from '@unhead/vue/client'
import type { Context } from 'hono'
import type { Hookable } from 'hookable'
import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'
import type { SSRContext } from 'vue/server-renderer'
import type { Env } from '~~/server/middleware/context'

export interface RuntimeHooks {
  'app:created': (app: App<Element>) => Promise<void> | void
  'app:beforeMount': (app: App<Element>) => Promise<void> | void
  'app:mounted': (app: App<Element>) => Promise<void> | void
  'app:beforeRender': (app: App<Element>, ssrContext: AppSSRContext) => Promise<void> | void
  'app:rendered': (ctx: AppRenderedContext) => Promise<void> | void

  'vue:error': (...args: Parameters<Parameters<typeof onErrorCaptured>[0]>) => Promise<void> | void
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
  context: Context<Env>
  modules: Set<string>
  url: string
}
