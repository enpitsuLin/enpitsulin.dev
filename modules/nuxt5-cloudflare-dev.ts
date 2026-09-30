import { builtinModules } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { addTemplate, defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'nuxt5-cloudflare-dev' },
  setup(_options, nuxt) {
    if (!nuxt.options.dev)
      return

    // Studio and Content need Node IPC/filesystem access during development.
    // Keep Cloudflare bindings local through Wrangler's supported Node proxy.
    const proxyOptions = {
      configPath: join(nuxt.options.rootDir, 'wrangler.jsonc'),
      envFiles: [],
      remoteBindings: false,
    }
    const workers = addTemplate({
      filename: 'cloudflare-dev.mjs',
      write: true,
      getContents: () => `
import { getPlatformProxy } from 'wrangler'
const platform = await getPlatformProxy(${JSON.stringify(proxyOptions)})
export const env = platform.env
export const dispose = () => platform.dispose()
`,
    })
    const cleanup = addTemplate({
      filename: 'cloudflare-dev-close.mjs',
      write: true,
      getContents: () => `
import { definePlugin } from 'nitro'
import { dispose } from ${JSON.stringify(workers.dst)}
export default definePlugin((nitro) => {
  nitro.hooks.hook('close', dispose)
})
`,
    })

    if (nuxt.options.experimental.nitroViteEnvironment) {
      const shimUrl = pathToFileURL(workers.dst).href
      // addVitePlugin scopes plugins to the app; register for Nitro as well.
      nuxt.hook('vite:extend', ({ config }) => {
        config.plugins ||= []
        config.plugins.push({
          name: 'nuxt5-cloudflare-dev-bindings',
          enforce: 'pre',
          applyToEnvironment: environment => ['nitro', 'ssr'].includes(environment.name),
          configEnvironment(name, environment) {
            if (!['nitro', 'ssr'].includes(name))
              return
            return {
              resolve: {
                // ModuleRunner must import the async shim as native Node ESM.
                builtins: [
                  ...(environment.resolve?.builtins ?? [...builtinModules.filter(id => !id.includes(':')), /^node:/, /^bun:/]),
                  shimUrl,
                ],
              },
            }
          },
          resolveId(id) {
            if (id === workers.dst || id === 'cloudflare:workers')
              return { id: shimUrl, external: true }
          },
        })
      })
    }

    nuxt.hook('nitro:config', (config) => {
      config.devServer ||= {}
      config.devServer.runner = 'node-worker'
      config.alias ||= {}
      config.alias['cloudflare:workers'] = workers.dst
      config.plugins ||= []
      config.plugins.push(cleanup.dst)
      config.rolldownConfig ||= {}
      // Keep the async binding setup outside Nitro's bundled app/plugin cycle.
      config.rolldownConfig.external = [workers.dst, 'wrangler']
    })
  },
})
