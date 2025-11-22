<script setup lang="ts">
import type { JSONParsed } from 'hono/utils/types'
import type { SelectPost } from '~~/server/database/schema'
import { formatDate } from '@vueuse/core'
import { motion } from 'motion-v'

interface Props {
  article: JSONParsed<SelectPost>
  delay?: number
}
const { article, delay = 0 } = defineProps<Props>()
</script>

<template>
  <motion.article
    :initial="{ y: 50, opacity: 0.001 }"
    :animate="{ y: 0, opacity: 1 }"
    :transition="{
      type: 'spring',
      duration: 0.4,
      bounce: 0,
      delay,
    }"
    grid="md:~ md:cols-4 md:items-baseline"
    class="ease-$spring-easing animate-in zoom-in-70 [animation-fill-mode:both]! [animation-range:entry_0%,exit_100%]! [animation-timeline:view(y)]!"
  >
    <div
      relative
      flex="~ col items-start"
      class="group md:col-span-3"
    >
      <ArticleCardTitle :title="article.title" :slug="article.slug" />
      <ArticleCardTime :date="article.publishedAt" class="md:hidden" />

      <div
        relative z-10 text-sm text="zinc-600 dark:zinc-400"
        class="max-w-80ch prose dark:prose-invert"
      >
        <p>{{ article.content.slice(0, 100) }}...</p>
      </div>
      <div
        aria-hidden="true"
        relative z-10 mt-4 flex items-center text-sm text-accent font-medium
      >
        立即阅读
        <i inline-block class="i-mingcute:right-small-line ml-1 size-4" />
      </div>
    </div>
    <div relative z-10 order-first class="hidden md:flex" flex="col items-start">
      <time
        mb-3 mt-1 text-sm
        class="text-zinc-500 dark:text-zinc-500"
        :datetime="article.publishedAt"
      >
        {{ formatDate(new Date(article.publishedAt), 'MMM DD YYYY', { locales: 'zh-Hans' }) }}
      </time>
      <div flex="~ gap-1 wrap" pr-10>
        <ArticleTag v-for="tag in []" :key="tag" :tag text-xs />
      </div>
    </div>
  </motion.article>
</template>
