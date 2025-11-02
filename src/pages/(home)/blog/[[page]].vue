<script setup lang="ts">
import { useQuery } from '@pinia/colada'

definePage({
  alias: '/blog/:page(\\d+)?',
})

const $hc = useHC()

const route = useRoute('/(home)/blog/[[page]]')

const page = computed<number>(() => route.params.page ? Number.parseInt(route.params.page as string) : 0)

const { data: posts } = useQuery({
  key: () => ['posts', page.value],
  async query() {
    const limit = 2
    const offset = Math.max(0, page.value) * limit
    const res = await $hc.api.post.$get({
      query: {
        limit: limit.toString(),
        offset: offset.toString(),
      },
    })
    return res.json()
  },
  placeholderData(previousData) {
    return previousData
  },
})
</script>

<template>
  <h1>Home</h1>
  <div>Page: {{ page }}</div>
  <template v-if="posts?.data">
    <p>We have loaded {{ posts.data.length }} posts</p>
    <details>
      <summary>Show raw</summary>
      <pre>{{ posts }}</pre>
    </details>

    <blockquote v-for="fact in posts.data" :key="fact.id">
      {{ fact.content }}
    </blockquote>
  </template>
  <RouterLink v-if="page > 0" :to="`/blog/${page - 1}`">
    上一页
  </RouterLink>
  <RouterLink v-if="posts?.total && (posts.total > posts.offset + posts.limit)" :to="`/blog/${page + 1}`">
    下一页
  </RouterLink>
</template>
