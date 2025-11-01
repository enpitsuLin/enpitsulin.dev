import type { RouteLocationRaw, Router } from 'vue-router'
import { parseQuery, parseURL, withoutBase } from 'ufo'
import { nextTick } from 'vue'
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

    // Store initial path from router (after initial push) for later comparison
    const initialRoute = router.currentRoute.value
    const initialPath = initialRoute.fullPath

    // Register hook to check route changes after component rendering
    zootApp.hook('app:rendered', async () => {
      // Wait for any pending router operations
      await nextTick()
      await router.isReady()

      // Check if route changed during rendering (e.g., by router.push in component setup)
      const finalRoute = router.currentRoute.value
      const finalPath = finalRoute.fullPath

      if (initialPath !== finalPath) {
        // Build complete redirect URL (including baseURL)
        const baseURL = zootApp.ssrContext!.runtimeConfig.app.baseURL
        zootApp.ssrContext!.redirect = new URL(finalPath, baseURL).toString()
        zootApp.callHook('app:redirected')
      }
    })
  }

  return {
    provide: {
      router,
    },
  }
})

declare module '~~/lib/app' {
  interface ZootApp {
    $router: Router
  }
}
