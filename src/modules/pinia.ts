import type { StateTree } from 'pinia'
import type { UserModule } from '~~/lib/types/app'
import { hydrateQueryCache, isQueryCache, PiniaColada, serializeQueryCache, useQueryCache } from '@pinia/colada'
import * as devalue from 'devalue'
import { createPinia } from 'pinia'

// Setup Pinia
// https://pinia.vuejs.org/
export const install: UserModule = ({ initialState, app, hooks }) => {
  const pinia = createPinia()
  app.use(pinia)

  app.use(PiniaColada, {})

  if (!import.meta.env.SSR) {
    pinia.state.value = initialState.pinia || {}

    const queryCache = useQueryCache(pinia)

    const revivedData = devalue.parse(initialState.queryCache, {
      PiniaColada_TreeMapNode: (data: ReturnType<typeof serializeQueryCache>) => data,
    })
    hydrateQueryCache(queryCache, revivedData)
  }

  else {
    initialState.pinia = pinia.state.value
    hooks.hook('app:rendered', () => {
      const queryCache = useQueryCache(pinia)

      initialState.queryCache = devalue.stringify(queryCache, {
        PiniaColada_TreeMapNode: (data: unknown) => isQueryCache(data) && serializeQueryCache(data),
      })
    })
  }
}

declare module '~/types' {
  interface AppInitialState {
    pinia: Record<string, StateTree>
    queryCache: any
  }
}
