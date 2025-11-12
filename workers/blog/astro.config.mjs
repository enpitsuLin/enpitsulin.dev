// @ts-check

import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import unocss from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), unocss()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: 'cloudflare',
  }),
})
