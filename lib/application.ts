import type { App } from 'vue'
import type { Application, AppPayload, AppSSRContext } from '~/types'

export interface AppOptions {
  vueApp: App<Element>
  initialState: Record<string, any>
  ssrContext?: AppSSRContext
}

export function createEApp({
  vueApp,
  ssrContext,
  initialState,
}: AppOptions) {
  const useApp = {
    id: 'enpitsulin.dev',
    vueApp,
    ssrContext,
    payload: shallowReactive<AppPayload>({
      data: shallowReactive({}),
      state: reactive({}),
    }),
  } as Application

  if (import.meta.env.SSR && useApp.ssrContext) {
    useApp.payload.path = useApp.ssrContext.url

    // Expose nuxt to the renderContext
    useApp.ssrContext.$eApp = useApp
    useApp.ssrContext.payload = useApp.payload

    initialState.payload = useApp.payload
  }

  if (!import.meta.env.SSR) {
    const data = initialState.payload as Record<string, any>
    if (data) {
      for (const key in data) {
        switch (key) {
          case 'data':
          case 'state':
            Object.assign(useApp.payload[key]!, data[key])
            break

          default:
            // @ts-expect-error: ignore
            useApp.payload[key] = data[key]
        }
      }
    }
  }

  Object.defineProperty(
    useApp.vueApp,
    '$eApp',
    { get: () => useApp },
  )
  Object.defineProperty(
    useApp.vueApp.config.globalProperties,
    '$eApp',
    { get: () => useApp },
  )

  return useApp
}
