import nodeLoaderCloudflare from '@hiogawa/node-loader-cloudflare/vite'
import react from '@vitejs/plugin-react'
import unocss from 'unocss/vite'
import inspect from 'vite-plugin-inspect'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'waku/config'

export default defineConfig({
  vite: {
    plugins: [
      viteTsconfigPaths(),
      inspect(),
      unocss(),
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      nodeLoaderCloudflare({
        environments: ['rsc'],
        build: true,
        // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
        getPlatformProxyOptions: {
          persist: {
            path: '.wrangler/state/v3',
          },
        },
      }),
    ],
  },
})
