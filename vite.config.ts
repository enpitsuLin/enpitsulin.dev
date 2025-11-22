import path from 'node:path'
import { cloudflare as Cloudflare } from '@cloudflare/vite-plugin'
import FullStack from '@hiogawa/vite-plugin-fullstack'
import { unheadVueComposablesImports } from '@unhead/vue'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defaultClientConditions, defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import * as _compiler from 'vue/compiler-sfc'

export default defineConfig({
  environments: {
    client: {
      build: {
        minify: false,
        rollupOptions: {
          input: {
            index: path.resolve(__dirname, 'src/entry-client.ts'),
          },
        },
      },
    },
    worker: {
      resolve: {
        conditions: [...defaultClientConditions],
      },
    },
  },
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '~~/': `${path.resolve(__dirname, '.')}/`,
    },
  },

  plugins: [
    Inspect({
      build: true,
    }),

    FullStack({
      serverHandler: false,
      serverEnvironments: ['ssr'],
    }),

    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      extensions: ['.vue'],
      dts: '.types/typed-router.d.ts',
    }),

    Vue({
      // workaround for https://github.com/cloudflare/workers-sdk/issues/11359#issuecomment-3560888535 related to import '.vue' file in worker environment in dev
      compiler: _compiler,
      include: [/\.vue$/, /\.md$/],
    }),

    VueJsx(),

    Cloudflare({
      viteEnvironment: {
        name: 'ssr',
      },
    }),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      include: [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        'vue',
        '@vueuse/core',
        unheadVueComposablesImports,
        VueRouterAutoImports,
      ],
      dts: '.types/auto-imports.d.ts',
      dirs: [
        'src/composables',
        'src/stores',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      directoryAsNamespace: true,
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md', 'tsx'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.tsx$/],
      dts: '.types/components.d.ts',
      dtsTsx: true,
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Unocss(),
  ],

  server: {
    cors: false,
    warmup: {
      ssrFiles: ['lib/**/*.ts'],
    },
  },

})
