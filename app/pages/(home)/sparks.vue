<script setup lang="ts">
import type { SparksPage } from '#shared/types/sparks'
import { Masonry, MasonryItem } from '~/components/ui/masonry'

definePageMeta({ layout: 'home' })

const { siteUrl } = useAppConfig()
useSeoMeta({
  title: '想法',
  description: '一些尚未写成文章的想法，和生活里偶尔闪过的火花。',
  ogTitle: '想法',
  ogDescription: '一些尚未写成文章的想法，和生活里偶尔闪过的火花。',
  ogUrl: `${siteUrl}/sparks`,
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl}/sparks` }] })

const { data, error, status, refresh } = await useFetch<SparksPage>('/api/sparks', { key: 'sparks' })
const { state: feed, isLoading: loadingMore, error: loadMoreError, executeImmediate: fetchNextPage } = useAsyncState(async (): Promise<SparksPage | undefined> => {
  const current = feed.value
  if (!current?.hasMore)
    return current
  const next = await $fetch<SparksPage>('/api/sparks', { query: { page: current.page + 1 } })
  const ids = new Set(current.items.map(item => item.id))
  return { ...next, items: [...current.items, ...next.items.filter(item => !ids.has(item.id))] }
}, data.value, {
  immediate: false,
  resetOnExecute: false,
  onError: () => undefined, // The inline retry state handles pagination errors.
})
watch(data, value => feed.value = value)

function loadMore() {
  if (!loadingMore.value && feed.value?.hasMore)
    return fetchNextPage()
}
</script>

<template>
  <HomePageContainer
    title="想法"
    description="一些尚未写成文章的想法，和生活里偶尔闪过的火花。" pb-8
  >
    <template #header>
      <div
        flex="~ wrap items-center justify-between gap-2" mb-5 pt-3 border="t border" un-text="xs zinc-500 dark:zinc-400"
        fade-in slide-in-from-bottom-3 animate="in delay-150! duration-800! ease-$spring-easing! fill-both! motion-reduce:none!"
      >
        <span flex="inline items-center gap-2">
          <span i-mingcute-sparkles-line un-text="accent base" aria-hidden="true" />
          随想 · 日常 · 灵感
        </span>
        <a
          v-if="feed" :href="feed.sourceUrl" target="_blank" rel="noopener noreferrer"
          flex="inline items-center gap-1" un-text="hover:accent" py-2 rounded
          ring="focus-visible:2 focus-visible:accent"
          transition="colors duration-200 motion-reduce:none"
        >
          在 Ech0 查看全部动态 <span i-mingcute-arrow-up-right-line aria-hidden="true" />
        </a>
      </div>
    </template>

    <div v-if="status === 'pending' && !feed" role="status" py-20 un-text="center sm zinc-500">
      正在收集火花…
    </div>
    <div
      v-else-if="error && !feed" role="alert" py-16 flex="~ col items-center gap-4" un-text="center"
      fade-in animate="in duration-500! motion-reduce:none!"
    >
      <span i-mingcute-cloud-line un-text="3xl zinc-400" aria-hidden="true" />
      <p un-text="sm zinc-500 dark:zinc-400">
        暂时没能加载想法，请稍后再试。
      </p>
      <button
        type="button" :disabled="status === 'pending'" px-4
        py-2 rounded-lg border="~ border" un-text="sm" bg="hover:zinc-100 dark:hover:zinc-800" ring="focus-visible:2 focus-visible:accent"
        cursor="pointer disabled:wait" transition="colors duration-200 motion-reduce:none" @click="refresh()"
      >
        {{ status === 'pending' ? '加载中…' : '重新加载' }}
      </button>
    </div>
    <template v-else-if="feed?.items.length">
      <Masonry as="ul" aria-label="想法列表" grid="cols-1 md:cols-2 xl:cols-3" w-full>
        <MasonryItem
          v-for="(spark, index) in feed.items" :key="spark.id" as="li"
          fade-in slide-in-from-bottom-6
          animate="in duration-800! ease-$spring-easing! delay-$spark-enter-delay! fill-both! motion-reduce:none!"
          :style="{ '--spark-enter-delay': `${120 + Math.min(index, 5) * 60}ms` }"
        >
          <SparksCard :spark="spark" />
        </MasonryItem>
      </Masonry>
      <div flex="~ col items-center gap-2" pt-4 fade-in animate="in delay-300! duration-700! fill-both! motion-reduce:none!">
        <p role="status" aria-live="polite" un-text="xs zinc-500 dark:zinc-400">
          {{ loadMoreError ? '后面的想法暂时没能加载，已显示的内容仍然保留。' : `已展示 ${feed.items.length} 条想法` }}
        </p>
        <button
          v-if="feed.hasMore" type="button" :disabled="loadingMore" :aria-busy="loadingMore" flex="inline items-center gap-2"
          px-5 py-3 rounded-full border="~ zinc-200 dark:zinc-700" un-text="sm zinc-700 dark:zinc-200"
          bg="white hover:zinc-100 dark:zinc-800 dark:hover:zinc-700" ring="focus-visible:2 focus-visible:accent"
          cursor="pointer disabled:wait" op="disabled:60" transition="colors duration-200 motion-reduce:none" @click="loadMore"
        >
          <span v-if="loadingMore" i-mingcute-loading-line animate="spin motion-reduce:none!" aria-hidden="true" />
          {{ loadingMore ? '加载中…' : loadMoreError ? '重试加载' : '加载更多' }}
          <span v-if="!loadingMore" i-mingcute-arrow-down-line aria-hidden="true" />
        </button>
        <p v-else un-text="xs zinc-400 dark:zinc-500">
          火花暂时收集到这里。
        </p>
      </div>
    </template>
    <div
      v-else role="status" flex="~ col items-center gap-4" py-20 un-text="center"
      fade-in slide-in-from-bottom-6 animate="in delay-150! duration-800! ease-$spring-easing! fill-both! motion-reduce:none!"
    >
      <span i-mingcute-sparkles-line un-text="4xl zinc-300 dark:zinc-600" aria-hidden="true" />
      <p un-text="base zinc-600 dark:zinc-300">
        下一点火花，还在酝酿中。
      </p>
      <p un-text="sm zinc-400 dark:zinc-500">
        有了新的想法，就记在这里。
      </p>
    </div>
  </HomePageContainer>
</template>
