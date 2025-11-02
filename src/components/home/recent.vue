<script setup lang="ts">
import { useQuery } from '@pinia/colada'

const $hc = useHC()
const { data } = useQuery({
  key: ['recent-posts'],
  query: async () => {
    const response = await $hc.api.post.$get({
      query: {
        limit: '2',
      },
    })
    return response.json()
  },
})
</script>

<template>
  <section w-full flex="~ col items-center" pb-10>
    <h1
      flex="~ items-center justify-between" w-full
      class="text-3xl text-zinc-700 font-bold tracking-tight sm:text-4xl dark:text-zinc-100"
      pb-12
    >
      最新文章
      <UiButton as-child>
        <RouterLink
          role="button"
          to="/blog"
        >
          <span text-sm>查看全部</span>
        </RouterLink>
      </UiButton>
    </h1>
    <div w-full grid="~ cols-1 md:cols-2 gap-16">
      <HomeRecentArticle
        v-for="article in data?.data"
        :key="article.id"
        :article="article"
      />
    </div>
  </section>
</template>
