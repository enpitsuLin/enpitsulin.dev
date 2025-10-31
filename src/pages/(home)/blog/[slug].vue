<script lang="ts">
import { defineColadaLoader } from 'unplugin-vue-router/data-loaders/pinia-colada'

type PostData = Awaited<ReturnType<typeof import('~~/server/routes/api/post/slug/[slug].get')['default']>>

export const usePostData = defineColadaLoader('/(home)/blog/[slug]', {
  async query(to, { signal }) {
    const res = await fetch(`http://localhost:3333/api/post/slug/${to.params.slug}`, {
      signal,
    })
    return res.json() as Promise<PostData>
  },
  key: to => ['posts', to.params.slug],
  staleTime: 12 * 60 * 60 * 1000,
})
</script>

<script setup lang="ts">
defineOptions({
  name: 'BlogPage',
})

const route = useRoute('/(home)/blog/[slug]')

const { data } = usePostData()
</script>

<template>
  <h1>Blog {{ route.params.slug }}</h1>
  <MarkdownRender :content="data?.content" />
</template>
