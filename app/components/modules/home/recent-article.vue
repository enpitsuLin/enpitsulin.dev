<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'

interface Props {
  article: BlogCollectionItem
}
const { article } = defineProps<Props>()
</script>

<template>
  <article
    flex="~ col items-start"
    relative
    class="group"
  >
    <ArticleCardTitle :title="article.title" :path="article.path" />
    <ArticleCardTime :date="article.publishedAt" />

    <ContentRenderer
      v-if="article.excerpt" flex-1
      class="relative z-10 mt-2 w-full text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
      :value="article.excerpt"
    />
    <div
      v-else flex-1
      class="relative z-10 mt-2 w-full text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
    >
      <p>{{ article.description || '这篇文章没有什么内容摘要捏...' }}</p>
    </div>

    <NuxtLink
      :to="{ name: 'blog-slug', params: { slug: article.meta.slug } }"
      relative z-10 mt-1 flex items-center text-sm text-accent font-medium
    >
      立即阅读
      <i inline-block class="i-mingcute:right-small-line ml-1 size-4" />
    </NuxtLink>
  </article>
</template>
