import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
  ],

  eslint: {
    config: {
      standalone: false,
    },
  },

  experimental: {
    typedPages: true,
  },

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
    rollupConfig: {
      external: ['cloudflare:email', 'mimetext'],
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        types: [fileURLToPath(new URL('./worker-configuration.d.ts', import.meta.url))],
      },
    },
    nodeTsConfig: {
      include: [
        fileURLToPath(new URL('./scripts/**/*.ts', import.meta.url)),
        fileURLToPath(new URL('./drizzle.config.ts', import.meta.url)),
      ],
    },
  },
})
