<script setup lang="ts">
import { useQuery } from '@pinia/colada'

defineOptions({
  name: 'BlogPage',
})

const $hc = useHC()

const route = useRoute('/(home)/blog/[slug]')

const { data } = useQuery({
  key: ['post', route.params.slug],
  query: async () => {
    const res = await $hc.api.post.slug[':slug'].$get(
      {
        param: { slug: route.params.slug },
      },
    )
    return res.json()
  },
  staleTime: 1000 * 60 * 60 * 24,
})
</script>

<template>
  <h1>Blog {{ route.params.slug }}</h1>
  <MarkdownRender :content="data?.content" />
</template>
