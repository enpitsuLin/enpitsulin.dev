export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxthub/core',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-studio',
    '@nuxt/fonts',
  ],

  devtools: { enabled: true },

  routeRules: {
    'feed.xml': { prerender: true },
  },

  hub: {
    db: 'sqlite',
    kv: true,
    blob: true,
  },

  ogImage: {
    zeroRuntime: true,
  },

  fonts: {
    families: [
      { name: 'Noto+Sans+SC', weights: [400], global: true },
    ],
  },

  studio: {
    repository: {
      provider: 'github', // 'github' or 'gitlab'
      owner: 'enpitsuLin',
      repo: 'enpitsulin.dev',
      branch: 'main',
    },
    i18n: {
      defaultLocale: 'zh',
    },
  },

  mdc: {
    components: {
      map: {
        details: 'prose-details',
        summary: 'prose-summary',
      },
    },
  },

  content: {
    build: {
      markdown: {
        rehypePlugins: {
          'rehype-unwrap-images': {},
        },
        toc: {
          depth: 3,
          searchDepth: 3,
        },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['js', 'jsx', 'json', 'ts', 'tsx', 'vue', 'css', 'html', 'vue', 'bash', 'md', 'mdc', 'yaml', 'toml', 'rust', 'sql'],
        },
      },
    },
  },

  components: {
    global: true,
    dirs: [
      {
        path: '~/components/modules',
      },
      '~/components',
    ],
  },

  experimental: {
    typedPages: true,
    viewTransition: true,
    inlineRouteRules: true,
    payloadExtraction: false,
    renderJsonPayloads: true,
  },

  runtimeConfig: {
    public: {

    },
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2026-04-03',

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
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
    // minify: false,
  },

  vite: {
    optimizeDeps: {
      include: [
        '@ark-ui/vue/*',
        '@ark-ui/vue',
        'motion-v',
      ],
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  typescript: {

  },
})
