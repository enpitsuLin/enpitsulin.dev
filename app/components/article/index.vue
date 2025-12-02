<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Post } from '~~/shared/types/post'

interface Props {
  article: SerializeObject<Post>
  delay?: number
}
const { article, delay = 0 } = defineProps<Props>()

const hasMore = computed(() => article.excerpt)
const excerptContent = computed(() => {
  return article.excerpt
})
</script>

<template>
  <article
    grid="md:~ md:cols-4 md:items-baseline"
    :style="{
      '--delay': `${Math.floor(delay * 1000)}ms`,
    }"
    class="translate-y-0 op-100 [@starting-style]:translate-y-50px [@starting-style]:op-0 duration-800 ease-$spring-easing delay-$delay"
  >
    <div
      relative
      flex="~ col items-start"
      class="group md:col-span-3"
    >
      <ArticleCardTitle :title="article.title" :slug="article.slug" />
      <ArticleCardTime :date="article.publishedAt" class="md:hidden" />

      <MDC
        v-if="hasMore"
        class="relative z-10 w-full text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
        excerpt partial
        :value="excerptContent!"
      />
      <div
        v-else
        class="relative z-10 w-full text-sm text-zinc-600 dark:text-zinc-400 max-w-80ch prose dark:prose-invert"
      >
        <p>{{ article.description || article.data.description || '这篇文章没有什么内容摘要捏...' }}</p>
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
      <NuxtTime
        mb-3 mt-1 text-sm
        class="text-zinc-500 dark:text-zinc-500"
        :datetime="article.publishedAt"
      />
      <div flex="~ gap-1 wrap" pr-10>
        <ArticleTag v-for="tag in []" :key="tag" :tag text-xs />
      </div>
    </div>
  </article>
</template>
