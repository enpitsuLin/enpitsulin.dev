<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { SelectPost } from '~~/server/database/schema'
import { motion } from 'motion-v'

interface Props {
  article: SerializeObject<SelectPost>
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
  >
    <div
      relative
      flex="~ col items-start"
      class="group md:col-span-3"
    >
      <ArticleCardTitle :title="article.title" :slug="article.slug" />
      <ArticleCardTime :date="article.publishedAt" class="md:hidden" />

      <div
        v-if="article.excerpt"
        class="relative z-10 text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
      >
        <p>{{ article.excerpt }}</p>
      </div>
      <MDC
        v-else
        class="relative z-10 text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
        excerpt partial
        :value="article.content"
      />
      <div
        aria-hidden="true"
        relative z-10 mt-4 flex items-center text-sm text-accent font-medium
      >
        立即阅读
        <i inline-block class="i-mingcute:right-small-line ml-1 size-4" />
      </div>
    </div>
    <div relative z-10 order-first class="hidden md:flex" flex="col items-start">
      <NuxtTime
        mb-3 mt-1 text-sm
        class="text-zinc-500 dark:text-zinc-500"
        :datetime="article.publishedAt"
      />
      <div flex="~ gap-1 wrap" pr-10>
        <ArticleTag v-for="tag in []" :key="tag" :tag text-xs />
      </div>
    </div>
  </motion.article>
</template>
