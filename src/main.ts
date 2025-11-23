import type { App as VueApp } from 'vue'
import type { CreateOptions, Plugin } from '~~/lib/app'
import { createSSRApp, nextTick } from 'vue'
import { applyPlugins, createZootApp } from '~~/lib/app'
import RootComponent from '~/App.vue'

const plugins = Object.values(import.meta.glob<Plugin>('./plugins/*.ts', { eager: true, import: 'default' }))

export async function createEntry(ssrContext: CreateOptions['ssrContext']): Promise<VueApp<Element>>
export async function createEntry(): Promise<VueApp<Element>>
export async function createEntry(ssrContext?: CreateOptions['ssrContext']) {
  const vueApp = createSSRApp(RootComponent)

  const zoot = createZootApp({ vueApp, ssrContext })

  try {
    await applyPlugins(zoot, plugins)
    await zoot.hooks.callHook('app:created', vueApp)
    if (!import.meta.env.SSR) {
      await zoot.hooks.callHook('app:beforeMount', vueApp)
      vueApp.mount(`#app`)
      await zoot.hooks.callHook('app:mounted', vueApp)
      await nextTick()
    }
  }
  catch (err) {
    await zoot.callHook('app:error', err)
    zoot.payload.error = (zoot.payload.error || err) as any
  }

  return vueApp
}

if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept()
}
