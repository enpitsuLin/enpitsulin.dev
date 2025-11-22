import type { VueHeadClient } from '@unhead/vue/client'
import { createHead as createClientHead, renderDOMHead } from '@unhead/vue/client'
import { defineZootPlugin } from '~~/lib/app'

export default defineZootPlugin((zootApp) => {
  const head = import.meta.env.SSR
    ? zootApp.ssrContext!.head
    : createClientHead()

  zootApp.vueApp.use(head)

  if (!import.meta.env.SSR) {
    // pause dom updates until page is ready and between page transitions
    let pauseDOMUpdates = true
    const syncHead = async () => {
      pauseDOMUpdates = false
      await renderDOMHead(head)
    }
    head.hooks.hook('dom:beforeRender', (context) => {
      context.shouldRender = !pauseDOMUpdates
    })
    zootApp.hooks.hook('page:start', () => {
      pauseDOMUpdates = true
    })
    // wait for new page before unpausing dom updates (triggered after suspense resolved)
    zootApp.hooks.hook('page:finish', () => {
      // app:suspense:resolve hook will unpause the DOM
      if (!zootApp.isHydrating) {
        syncHead()
      }
    })
    // unpause on error
    zootApp.hooks.hook('app:error', syncHead)
    // unpause the DOM once the mount suspense is resolved
    zootApp.hooks.hook('app:suspense:resolve', syncHead)
  }
})

declare module '~~/lib/app' {
  interface ZootApp {
    $head: VueHeadClient
  }
}
