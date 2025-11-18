import unocss from 'unocss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {

  },
  plugins: [
    tsconfigPaths(),
    unocss(),
  ],
})
