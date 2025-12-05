// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    formatters: true,
    pnpm: false,
    vue: {
      vueVersion: 3,
    },
    rules: {
      'vue/no-multiple-template-root': 'off',
      'import-lite/first': 'off',
    },
  }),
)
