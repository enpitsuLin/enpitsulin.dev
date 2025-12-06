import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

export const THOUGHTS_LIMIT = 8

export const useThoughts = defineColadaLoader('thoughts', {
  key: ['thoughts'],
  async query(_, { signal }) {
    return $fetch('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
      },
      signal,
    })
  },
})
