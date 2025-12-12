import { fileURLToPath } from 'node:url'

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
  ],

  devtools: { enabled: true },

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

  mdc: {
    remarkPlugins: {
      'remark-lesetid': {},
    },
    rehypePlugins: {
      'rehype-unwrap-images': {},
    },
    headings: {
      anchorLinks: true,
    },
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      langs: ['js', 'jsx', 'json', 'ts', 'tsx', 'vue', 'css', 'html', 'vue', 'bash', 'md', 'mdc', 'yaml', 'toml', 'rust', 'sql'],
      shikiEngine: 'javascript',
    },
    components: {
      map: {
        details: 'prose-details',
        summary: 'prose-summary',
      },
    },
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
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: [fileURLToPath(new URL('./worker-configuration.d.ts', import.meta.url))],
        },
      },
    },
    experimental: {
      websocket: true,
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
