export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
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

  hub: {
    kv: true,
    blob: true,
    database: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
