import type { DataLoaderPluginOptions } from 'vue-router/experimental'
import { DataLoaderPlugin } from 'vue-router/experimental'

export default defineNuxtPlugin({
  name: 'data-loaders',
  dependsOn: ['nuxt:router'],
  setup(nuxtApp) {
    nuxtApp.vueApp.use(DataLoaderPlugin, {
      router: nuxtApp.vueApp.config.globalProperties.$router,
      isSSR: import.meta.server,

      errors(reason) {
        console.error('[Data Loaders]', reason)
        return false
      },
    } satisfies DataLoaderPluginOptions)
  },
})
