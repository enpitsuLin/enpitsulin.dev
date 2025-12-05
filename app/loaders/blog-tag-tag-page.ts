import { normalizPage } from '#shared/utils/normalize-page'
import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

const POSTS_LIMIT = 10

export const useTagPostsData = defineColadaLoader('blog-tag-tag-page', {
  key: to => ['tag-posts', to.params.tag, to.params.page ?? '1'],
  async query(to, { signal }) {
    const page = normalizPage(to.params.page)
    return $fetch(`/api/post/tag/${to.params.tag}`, {
      query: {
        limit: POSTS_LIMIT,
        offset: (page - 1) * POSTS_LIMIT,
      },
      signal,
    })
  },
  staleTime: 10 * 1000,
})
