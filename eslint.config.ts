import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  rules: {
    'vitest/prefer-lowercase-title': 'off',
  },
})
