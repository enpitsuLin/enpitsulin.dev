export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/mdc',
    'nuxt-auth-utils',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@vueuse/nuxt',
    '@nuxthub/core',
    '@nuxt/content',
    'nuxt-studio',
  ],

  devtools: { enabled: true },

  hub: {
    db: 'sqlite',
    kv: true,
    blob: true,
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-lesetid': { options: { dataKey: 'estimation' } },
        },
        rehypePlugins: {
          'rehype-unwrap-images': {},
        },
        toc: {
          depth: 3,
          searchDepth: 3,
        },
      },
    },
  },

  components: {
    global: true,
    dirs: [
      {
        path: '~/components/prose',
        prefix: 'prose',
        isAsync: false,
      },
      {
        path: '~/components/modules',
      },
      '~/components',
    ],
  },

  imports: {
    dirs: ['loaders'],
  },

  experimental: {
    typedPages: true,
    viewTransition: true,
  },

  runtimeConfig: {
    public: {

    },
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2025-12-02',

  nitro: {
    preset: 'cloudflare-durable',
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
      wrangler: {
        // configurate durable here to avoid dev warning
        durable_objects: {
          bindings: [
            {
              name: '$DurableObject',
              class_name: '$DurableObject',
            },
          ],
        },
        migrations: [
          {
            tag: 'v1',
            new_classes: [
              '$DurableObject',
            ],
          },
        ],
      },
    },
    moduleSideEffects: ['reflect-metadata'],
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    experimental: {
      websocket: true,
    },
    unenv: {
      external: ['cloudflare:workers'],
    },
    // minify: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  typescript: {

  },
})
