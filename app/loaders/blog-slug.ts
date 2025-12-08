import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

export const usePostData = defineColadaLoader('blog-slug', {
  key: to => ['post', to.params.slug],
  async query(to, { signal }) {
    return $fetch(`/api/post/${to.params.slug as ':slug'}`, { signal })
  },
  staleTime: 10 * 1000,
})

export const useSurroundPostData = defineColadaLoader('blog-slug', {
  key: to => ['post', to.params.slug, 'surround'],
  async query(to, { signal }) {
    return $fetch(`/api/post/${to.params.slug as ':slug'}/surround`, { signal })
  },
  staleTime: 10 * 1000,
})
