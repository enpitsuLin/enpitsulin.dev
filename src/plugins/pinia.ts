import { hydrateQueryCache, isQueryCache, PiniaColada, serializeQueryCache, useQueryCache } from '@pinia/colada'
import * as devalue from 'devalue'
import { createPinia } from 'pinia'

import { defineZootPlugin } from '~~/lib/app'

export default defineZootPlugin((zootApp) => {
  const pinia = createPinia()
  zootApp.vueApp.use(pinia)
  zootApp.vueApp.use(PiniaColada, {})

  const queryCache = useQueryCache(pinia)

  if (import.meta.env.SSR) {
    zootApp.payload.pinia = pinia.state.value
  }
  else {
    pinia.state.value = zootApp.payload.pinia || {}
  }

  if (import.meta.env.SSR) {
    zootApp.hook('app:rendered', ({ ssrContext }) => {
      if (ssrContext) {
        ssrContext.payload.pinia_colada = devalue.stringify(queryCache, {
          PiniaColada_TreeMapNode: (data: unknown) => isQueryCache(data) && serializeQueryCache(data),
        })

        queryCache.caches.clear()
      }
    })
  }
  else if (zootApp.payload && zootApp.payload.pinia_colada) {
    const revivedData = devalue.parse(zootApp.payload.pinia_colada, {
      PiniaColada_TreeMapNode: (data: ReturnType<typeof serializeQueryCache>) => data,
    })
    hydrateQueryCache(queryCache, revivedData)
  }
})
