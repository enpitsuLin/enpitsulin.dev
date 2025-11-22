import type { _UseQueryEntryNodeValueSerialized } from '@pinia/colada'
import type { StateTree } from 'pinia'
import { hydrateQueryCache, isQueryCache, PiniaColada, serializeQueryCache, useQueryCache } from '@pinia/colada'
import { createPinia, shouldHydrate } from 'pinia'

import { defineZootPlugin } from '~~/lib/app'
import { definePayloadReducer, definePayloadReviver } from '~~/lib/payload'

export default defineZootPlugin((zootApp) => {
  const pinia = createPinia()
  zootApp.vueApp.use(pinia)
  zootApp.vueApp.use(PiniaColada, {})

  const queryCache = useQueryCache(pinia)

  definePayloadReducer(
    'skipHydrate',
    // We need to return something truthy to be treated as a match
    (data: unknown) => !shouldHydrate(data) && 1,
  )
  definePayloadReviver('skipHydrate', (_data: 1) => undefined)

  definePayloadReducer('PiniaColada_QueryCache', (data: unknown) => {
    return isQueryCache(data) && serializeQueryCache(data)
  })

  // we let pinia colada handle the revive
  definePayloadReviver(
    'PiniaColada_QueryCache',
    (data: ReturnType<typeof serializeQueryCache>) => data,
  )

  if (import.meta.env.SSR) {
    zootApp.payload.pinia = pinia.state.value
  }
  else {
    pinia.state.value = (zootApp.payload.pinia || {})
  }

  if (import.meta.env.SSR) {
    zootApp.hook('app:rendered', ({ ssrContext }) => {
      if (ssrContext) {
        ssrContext.payload.pinia_colada = markRaw(serializeQueryCache(queryCache))

        queryCache.caches.clear()
      }
    })
  }
  else if (zootApp.payload && zootApp.payload.pinia_colada) {
    hydrateQueryCache(queryCache, zootApp.payload.pinia_colada)
  }
})

declare module '~~/lib/app' {
  interface ZootPayload {
    pinia?: Record<string, StateTree>
    pinia_colada?: Record<string, _UseQueryEntryNodeValueSerialized<unknown, unknown>>
  }
}
