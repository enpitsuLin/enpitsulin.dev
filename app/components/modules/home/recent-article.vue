<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Post } from '~~/shared/types/post'

interface Props {
  article: SerializeObject<Post>
}
const { article } = defineProps<Props>()
</script>

<template>
  <article
    flex="~ col items-start"
    relative
    class="group"
  >
    <ArticleCardTitle :title="article.title" :slug="article.slug" />
    <ArticleCardTime :date="article.publishedAt" />

    <MDCRenderer
      v-if="article.excerpt"
      class="relative z-10 mt-2 w-full text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
      :body="article.excerpt"
    />
    <div
      v-else
      class="relative z-10 mt-2 w-full text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
    >
      <p>{{ article.description || article.data.description || '这篇文章没有什么内容摘要捏...' }}</p>
    </div>

    <div
      aria-hidden="true"
      relative z-10 mt-1 flex items-center text-sm text-accent font-medium
    >
      立即阅读
      <i inline-block class="i-mingcute:right-small-line ml-1 size-4" />
    </div>
  </article>
</template>
