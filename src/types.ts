import type { VueHeadClient } from '@unhead/vue/client'
import type { Hookable } from 'hookable'
import type { App } from 'vue'
import type { Router, RouteRecordRaw } from 'vue-router'

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
