import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  build: {
    // https://github.com/unocss/unocss/blob/1bcc90169a024b53844910f0df1bc5929fb8210b/packages-integrations/vite/src/modes/global/build.ts#L128
    // workaround since unocss doesn't check per-environment `outDir`.
    // otherwise build style breaks with
    // > [plugin unocss:global:build:generate] [unocss] failed to find vite:css-post plugin. It might be an internal bug of UnoCSS
    outDir: 'dist/client',
    minify: false,
  },
  plugins: [
    devtoolsJson(),
    tsconfigPaths(),
    unocss(),
    inspect(),
    rsc({
      entries: {
        // rsc: '<check wrangler.jsonc>',
        client: './framework/rsc/entry-client.tsx',
        ssr: './framework/rsc/entry-server.tsx',
      },
      serverHandler: false,
      loadModuleDevProxy: true,
    }),

    cloudflare({
      configPath: './wrangler.jsonc',
      viteEnvironment: {
        name: 'rsc',
      },
    }),

    react(),
  ],

  environments: {
    rsc: {
      build: {
        rollupOptions: {
          // ensure `default` export only in cloudflare entry output
          preserveEntrySignatures: 'exports-only',
        },
      },
      optimizeDeps: {
        include: ['turbo-stream'],
      },
    },
    ssr: {
      keepProcessEnv: false,
      build: {
        // build `ssr` inside `rsc` directory so that
        // wrangler can deploy self-contained `dist/rsc`
        outDir: './dist/rsc/ssr',
      },
      resolve: {
        noExternal: true,
      },
    },
  },
})
