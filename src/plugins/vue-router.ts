import type { RouteLocationRaw, Router, RouteRecordRaw } from 'vue-router'
import { parseQuery, parseURL, withoutBase } from 'ufo'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { defineZootPlugin, useRuntimeConfig } from '~~/lib/app'
import { documentReady } from '~~/lib/document-ready'

function getRouteFromPath(fullPath: string): RouteLocationRaw {
  const url = parseURL(fullPath.toString())
  return {
    path: url.pathname,
    query: parseQuery(url.search),
    hash: url.hash,
  }
}

export default defineZootPlugin(async (zootApp) => {
  const initialURL = !import.meta.env.SSR
    ? withoutBase(window.location.pathname, useRuntimeConfig().app.baseURL) + window.location.search + window.location.hash
    : zootApp.ssrContext!.url

  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes,
  })

  if (!import.meta.env.SSR) {
    await documentReady()
  }

  zootApp.vueApp.use(router)

  if (import.meta.env.SSR) {
    const route = getRouteFromPath(initialURL)
    await router.push(route)
    await router.isReady()
  }

  return {
    provide: {
      routes,
      router,
    },
  }
})

declare module '~~/lib/app' {
  interface ZootApp {
    $router: Router
    $routes: RouteRecordRaw[]
  }
}
