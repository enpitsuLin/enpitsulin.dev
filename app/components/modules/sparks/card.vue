<script setup lang="ts">
import type { Spark } from '#shared/types/sparks'

defineProps<{ spark: Spark }>()

const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
</script>

<template>
  <article
    p-4 min-w-0 overflow-hidden
    bg="white dark:zinc-800/40"
    border="~ zinc-200/80 hover:zinc-300 dark:zinc-700/60 dark:hover:zinc-600 focus-within:accent/40 rounded-2xl"
    shadow="hover:lg hover:zinc-900/5 dark:hover:black/15"
    translate-y="motion-safe:hover:-0.5 motion-safe:focus-within:-0.5"
    transition="[transform,box-shadow,border-color] duration-250 ease-out motion-reduce:none"
  >
    <div flex="~ items-center gap-2" mb-3 un-text="xs zinc-500 dark:zinc-400">
      <span i-mingcute-sparkles-line un-text="accent base" aria-hidden="true" />
      <time :datetime="spark.createdAt">{{ dateFormat.format(new Date(spark.createdAt)) }}</time>
    </div>

    <div
      prose="~ dark:invert" max-w-none break-words
      un-text="sm zinc-700 dark:zinc-200" leading-6
      overflow-x="[&_pre]:auto" max-w="[&_img]:full"
    >
      <MDCRenderer :body="spark.body" :components="{ img: 'img' }" />
    </div>

    <div v-if="spark.media.length" flex="~ col gap-2" mt-3>
      <template v-for="media in spark.media" :key="media.id">
        <a
          v-if="media.kind === 'image'" :href="media.url" target="_blank" rel="noopener noreferrer"
          block overflow-hidden rounded-xl ring="focus-visible:2 focus-visible:accent" ring-offset-2
          :aria-label="`查看图片：${media.name}`"
        >
          <img
            :src="media.url" :alt="media.name" :width="media.width" :height="media.height"
            loading="lazy" decoding="async" w-full h-auto bg="zinc-100 dark:zinc-800"
          >
        </a>
        <video
          v-else-if="media.kind === 'video'" :src="media.url" controls preload="metadata"
          :width="media.width" :height="media.height" :aria-label="media.name"
          w-full rounded-xl
        />
        <audio
          v-else-if="media.kind === 'audio'" :src="media.url" controls preload="none"
          :aria-label="media.name" w-full
        />
        <a
          v-else :href="media.url" target="_blank" rel="noopener noreferrer"
          flex="~ items-center gap-2" p-3 rounded-lg bg="zinc-100 dark:zinc-800"
          un-text="sm accent" break-all ring="focus-visible:2 focus-visible:accent"
        >
          <span i-mingcute-attachment-line shrink-0 aria-hidden="true" />
          {{ media.name }}
        </a>
      </template>
    </div>

    <footer flex="~ wrap items-center justify-between gap-2" mt-3 pt-2 border="t zinc-100 dark:zinc-700/60">
      <div flex="~ wrap gap-2" un-text="xs zinc-500 dark:zinc-400">
        <span v-for="tag in spark.tags" :key="tag">#{{ tag }}</span>
      </div>
      <a
        :href="spark.url" target="_blank" rel="noopener noreferrer"
        flex="inline items-center gap-1" un-text="xs zinc-500 hover:accent dark:zinc-400 dark:hover:accent"
        py-1 rounded ring="focus-visible:2 focus-visible:accent"
        transition="colors duration-200 motion-reduce:none"
        :aria-label="`查看 ${dateFormat.format(new Date(spark.createdAt))} 的原帖`"
      >
        查看原帖 <span i-mingcute-arrow-up-right-line aria-hidden="true" />
      </a>
    </footer>
  </article>
</template>
