import { addVitePlugin, defineNuxtModule } from 'nuxt/kit'

const moduleFiles = [
  '/@nuxt/content/dist/runtime/internal/api.js',
  '/nuxt-studio/dist/module/runtime/host.dev.js',
  '/nuxt-studio/dist/module/runtime/utils/activation.js',
  '/nuxt-studio/dist/module/runtime/composables/useMeta.js',
]

const namedFetchImport = /\bimport\b\s*(?:[\w$]+\s*,\s*)?\{[^}]*\$fetch\b[^}]*\}\s*from\s*['"]/

export default defineNuxtModule({
  meta: { name: 'nuxt5-module-fetch' },
  setup() {
    addVitePlugin({
      name: 'nuxt5-module-client-fetch',
      transform(code, id) {
        const path = id.replaceAll('\\', '/').split('?')[0] || ''
        if (!moduleFiles.some(file => path.endsWith(file)) || namedFetchImport.test(code))
          return
        // Content and Studio still expect the global $fetch removed from Nuxt 5 clients.
        return { code: `import { $fetch } from '#imports';\n${code}`, map: null }
      },
    }, { server: false })
  },
})
