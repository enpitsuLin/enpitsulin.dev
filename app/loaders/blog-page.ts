import { normalizePage } from '#shared/utils/normalize-page'
import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

const POSTS_LIMIT = 5

export const usePostsData = defineColadaLoader('blog-page', {
  key: to => ['posts', normalizePage(to.params.page)],
  async query(to, { signal }) {
    const page = normalizePage(to.params.page)

    return $fetch('/api/post', {
      query: {
        limit: POSTS_LIMIT,
        offset: (page - 1) * POSTS_LIMIT,
      },
      signal,
    })
  },
  lazy: false,
})
