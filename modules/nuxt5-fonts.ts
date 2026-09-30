import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'nuxt5-fonts' },
  setup(_options, nuxt) {
    if (nuxt.options.dev)
      return

    let assets: { assetsBaseURL: string, renderedFontURLs: Map<string, string> } | undefined
    nuxt.hook('fonts:public-asset-context', (context) => {
      assets = context
    })

    nuxt.hook('nitro:init', (nitro) => {
      // Nuxt 5 prerenders before the @nuxt/fonts rollup:before downloader runs.
      // OG images need the font bytes during prerender, not just empty placeholders.
      nitro.hooks.hook('prerender:init', async () => {
        if (!assets)
          return

        const outputDir = join(nitro.options.output.publicDir, assets.assetsBaseURL.replace(/^\/+/, ''))
        const cacheDir = join(nuxt.options.rootDir, 'node_modules/.cache/nuxt5-fonts')
        await Promise.all([mkdir(outputDir, { recursive: true }), mkdir(cacheDir, { recursive: true })])
        await Promise.all([...assets.renderedFontURLs].map(async ([filename, url]) => {
          const cachePath = join(cacheDir, filename)
          let data = existsSync(cachePath) ? await readFile(cachePath) : undefined
          if (!data?.length) {
            const response = await fetch(url, { signal: AbortSignal.timeout(60000) })
            if (!response.ok)
              throw new Error(`Failed to download font ${filename}: ${response.status}`)
            data = Buffer.from(await response.arrayBuffer())
            if (!data.length)
              throw new Error(`Downloaded font ${filename} is empty`)
            await writeFile(cachePath, data)
          }
          await writeFile(join(outputDir, filename), data)
        }))
      })
    })
  },
})
