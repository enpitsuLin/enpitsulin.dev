<script setup lang="ts">
import type { JSONParsed } from 'hono/utils/types'
import type { SelectPost } from '~~/server/database/schema'

interface Props {
  article: JSONParsed<SelectPost>
}
defineProps<Props>()
</script>

<template>
  <article
    flex="~ col items-start"
    relative
    class="group"
  >
    <ArticleCardTitle :title="article.title" :slug="article.slug" />
    <ArticleCardTime :date="article.publishedAt" />

    <div
      relative z-10 mt-2 w-full text-sm text="zinc-600 dark:zinc-400"
    >
      <!-- TODO: 截取文章内容 -->
      <p>{{ article.content.slice(0, 100) }}...</p>
    </div>

    <div
      aria-hidden="true"
      relative z-10 mt-4 flex items-center text-sm text-accent font-medium
    >
      立即阅读
      <i inline-block class="i-mingcute:right-small-line ml-1 size-4" />
    </div>
  </article>
</template>
