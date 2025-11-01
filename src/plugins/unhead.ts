import type { VueHeadClient } from '@unhead/vue/client'
import { createHead as createClientHead } from '@unhead/vue/client'
import { createHead as createSSRHead } from '@unhead/vue/server'
import { defineZootPlugin } from '~~/lib/app'

export default defineZootPlugin((zootApp) => {
  const head = import.meta.env.SSR ? createSSRHead() : createClientHead()
  zootApp.vueApp.use(head)

  return {
    provide: {
      head,
    },
  }
})

declare module '~~/lib/app' {
  interface ZootApp {
    $head: VueHeadClient
  }
}
