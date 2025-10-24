import type { AppContext, UserModule } from '~/types'
import { createHead as createClientHead } from '@unhead/vue/client'
import { createHead as createSSRHead } from '@unhead/vue/server'
import { createHooks } from 'hookable'
import { setupLayouts } from 'layouts-generated'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import { routes } from 'vue-router/auto-routes'
import { documentReady } from '~/lib/document-ready'
import { deserializeState } from '~/lib/state'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

export async function createApp(routePath?: string) {
  const app = createSSRApp(App)

  const head = import.meta.env.SSR ? createSSRHead() : createClientHead()

  app.use(head)

  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    // @ts-expect-error: ignore readonly
    routes: setupLayouts(routes),
  })

  const hooks: AppContext['hooks'] = createHooks()

  const context: AppContext = {
    app,
    head,
    routes,
    router,
    initialState: {} as Record<string, any>,
    routePath,
    hooks,
  }
  if (!import.meta.env.SSR) {
    await documentReady()
    const stateStrFromDom = JSON.parse(window.__INITIAL_STATE__.textContent) as string
    context.initialState = deserializeState(stateStrFromDom)
  }

  Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
    .forEach(i => i.install?.(context))

  app.use(router)

  let entryRoutePath: string | undefined
  let isFirstRoute = true
  router.beforeEach((to, _from, next) => {
    if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false
      entryRoutePath = to.path
      to.meta.state = context.initialState
    }

    next()
  })

  if (import.meta.env.SSR) {
    const route = context.routePath ?? '/'
    router.push(route)

    await router.isReady()
    context.initialState = router.currentRoute.value.meta.state as Record<string, any> || {} as Record<string, any>
  }

  const initialState = context.initialState

  return {
    ...context,
    initialState,
  } as AppContext
}

declare global {
  interface Window {
    __INITIAL_STATE__: HTMLScriptElement
  }
}
