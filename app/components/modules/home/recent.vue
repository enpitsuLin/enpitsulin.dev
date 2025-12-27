<script setup lang="ts">
const { data } = await useAsyncData('recent-post', () =>
  queryCollection('blog')
    .limit(2)
    .order('publishedAt', 'DESC')
    .all())
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
        <NuxtLink
          role="button"
          to="/blog"
        >
          <span text-sm>查看全部</span>
        </NuxtLink>
      </UiButton>
    </h1>
    <div w-full grid="~ cols-1 md:cols-2 gap-16">
      <HomeRecentArticle
        v-for="article in data"
        :key="article.path"
        :article="article"
      />
    </div>
  </section>
</template>
