import { normalizPage } from '#shared/utils/normalize-page'
import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

const POSTS_LIMIT = 20

export const useAdminPostsData = defineColadaLoader('admin-posts-page', {
  key: to => ['admin-posts', normalizPage(to.params.page)],
  async query(to, { signal }) {
    const page = normalizPage(to.params.page)
    return $fetch('/api/post', {
      query: {
        limit: POSTS_LIMIT,
        offset: (page - 1) * POSTS_LIMIT,
      },
      signal,
    })
  },
  staleTime: 10 * 1000,
})
