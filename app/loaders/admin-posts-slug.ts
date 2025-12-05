import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

export const useAdminPostsSlugData = defineColadaLoader('admin-posts-slug', {
  key: to => ['post', to.params.slug],
  async query(to, { signal }) {
    return $fetch(`/api/post/${to.params.slug}`, { signal })
  },
  staleTime: 10 * 1000,
})
