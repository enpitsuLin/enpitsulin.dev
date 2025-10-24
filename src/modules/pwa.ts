import type { ResolvableLink } from '@unhead/vue'
import type { UserModule } from '~/types'
import { pwaInfo } from 'virtual:pwa-info'
import { defineComponent, ref } from 'vue'

// https://github.com/antfu/vite-plugin-pwa#automatic-reload-when-new-content-available
export const install: UserModule = ({ router }) => {
  if (import.meta.env.SSR)
    return

  router.isReady()
    .then(async () => {
      const { registerSW } = await import('virtual:pwa-register')
      registerSW({ immediate: true })
    })
    .catch(() => { })
}

export const PWAManifest = defineComponent({
  setup() {
    if (pwaInfo) {
      const meta = ref<{ link: ResolvableLink[] }>({ link: [] })
      useHead(meta)

      const { webManifest } = pwaInfo
      if (webManifest) {
        const { href, useCredentials } = webManifest
        if (useCredentials) {
          meta.value.link!.push({
            rel: 'manifest',
            href,
            crossorigin: 'use-credentials',
          })
        }
        else {
          meta.value.link!.push({
            rel: 'manifest',
            href,
          })
        }
      }
    }

    return () => null
  },
})
