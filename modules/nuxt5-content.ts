import { join } from 'node:path'
import { createResolver, defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'nuxt5-content' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('nitro:config', (config) => {
      // Content 3 reads SQL dumps from Nitro 2's build mount while prerendering.
      // Nitro 3 no longer creates that mount, so expose only the generated dumps.
      config.devStorage ||= {}
      config.devStorage['build:content:raw'] ||= {
        driver: 'fs',
        base: join(nuxt.options.buildDir, 'content', 'raw'),
        readOnly: true,
      }

      // Internal Content queries bypass the Worker's public asset entry point.
      // Its current Cloudflare handler reads the removed event.context.cloudflare.
      for (const handler of config.handlers || []) {
        if (handler.handler.includes('/runtime/presets/cloudflare/database-handler'))
          handler.handler = resolver.resolve('./runtime/content-dump')
      }
    })
  },
})
