export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@nuxt/content',
    '@nuxt/fonts',
    'nuxt-og-image',
    'nuxt-studio',
  ],

  devtools: { enabled: true },

  routeRules: {
    'feed.xml': { prerender: true },
    '/sparks': { prerender: false },
    '/api/sparks': { prerender: false },
  },

  ogImage: {
    zeroRuntime: true,
  },

  fonts: {
    providers: {
      cdn: '~~/providers/cdn',
    },
    families: [
      {
        name: 'HarmonyOS Sans SC',
        provider: 'cdn',
        weights: [400, 500, 700],
        styles: ['normal'],
        // The upstream Chinese fonts are full files, so load them only when used.
        preload: false,
      },
      { name: 'Inter', provider: 'google', weights: ['400 700'], styles: ['normal'] },
      {
        name: 'MonaspiceArNerdFont',
        provider: 'local',
        weights: [500],
        styles: ['normal'],
        preload: false,
      },
      {
        name: 'Noto Sans SC',
        provider: 'fontsource',
        weights: [400, 600],
        styles: ['normal'],
        // Use complete Chinese faces so Takumi can render every title character.
        subsets: ['chinese-simplified'],
        global: true,
        preload: false,
      },
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
    dirs: [
      {
        path: '~/components/modules',
      },
      {
        path: '~/components',
        ignore: ['ui/masonry/*.ts'],
      },
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
    ech0BaseUrl: 'https://ech0.enpitsulin.dev',
    ech0Tag: '想法',
    public: {

    },
  },

  future: { compatibilityVersion: 4 },
  compatibilityDate: '2026-04-03',

  nitro: {
    preset: 'cloudflare-durable',
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: ['@cloudflare/workers-types'],
        },
      },
    },
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
    tsConfig: {
      compilerOptions: {
        types: ['@cloudflare/workers-types'],
      },
    },
  },
})
