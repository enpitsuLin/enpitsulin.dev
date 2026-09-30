import { fileURLToPath } from 'node:url'

const siteUrl = 'https://enpitsulin.dev'

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

  // Inline app config is shared with Nuxt 5's server runtime.
  appConfig: {
    author: 'enpitsulin',
    siteUrl,
    title: 'Promise { <pending> }',
    description: 'What are you looking for?',
    defaultOgImage: new URL('/placeholder-social.png', siteUrl).href,
  },

  hooks: {
    'nitro:config': function (config) {
      // Older modules register global middleware without Nitro 3's required route.
      for (const handler of config.handlers || []) {
        if (handler.middleware && !handler.route)
          handler.route = '/**'
      }
      // Keep the virtual server entry from resolving below the client file alias.
      const componentMeta = config.alias?.['#nuxt-component-meta']
      if (componentMeta)
        config.alias!['#nuxt-component-meta/nitro'] = componentMeta
    },
  },

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
    experimental: {
      // Nitro 3 bundles the old native addon; use Node's SQLite for prerendering.
      sqliteConnector: 'native',
    },
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
          langs: ['js', 'jsx', 'json', 'jsonc', 'ts', 'tsx', 'vue', 'css', 'html', 'bash', 'powershell', 'bat', 'ini', 'md', 'mdc', 'yaml', 'toml', 'rust', 'sql'],
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
    nitroViteEnvironment: true,
    typedPages: true,
    viewTransition: true,
    inlineRouteRules: true,
    payloadExtraction: false,
  },

  runtimeConfig: {
    ech0BaseUrl: 'https://ech0.enpitsulin.dev',
    ech0Tag: '想法',
    ech0Token: '',
    public: {

    },
  },

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

    features: {
      websocket: true,
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
    serverTsConfig: {
      // These generated augmentations are not yet registered in the server context.
      include: [
        fileURLToPath(new URL('./.nuxt/content/types.d.ts', import.meta.url)),
        fileURLToPath(new URL('./.nuxt/types/shared-app.config.d.ts', import.meta.url)),
      ],
      compilerOptions: {
        types: ['@cloudflare/workers-types'],
      },
    },
    tsConfig: {
      // Generated API route types also bring server handlers into the app context.
      include: [fileURLToPath(new URL('./.nuxt/types/shared-app.config.d.ts', import.meta.url))],
      compilerOptions: {
        types: ['@cloudflare/workers-types'],
      },
    },
  },
})
