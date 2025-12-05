<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'

interface Props {
  thought: SerializeObject<Thought>
}
const { thought } = defineProps<Props>()
</script>

<template>
  <article flex="~ col items-start" relative>
    <div v-if="thought.mood" text="2xl" mb-2>
      {{ thought.mood }}
    </div>
    <MDCRenderer
      class="relative z-10 w-full prose dark:prose-invert"
      :body="thought.body"
    />
    <div
      flex="~ items-center"
      pl-3.5 text-sm
      text="zinc-500 dark:zinc-500"
      z-10 relative mt-2
    >
      <NuxtTime :datetime="thought.publishedAt" time-zone="Asia/Shanghai">
        {{ useDateFormat(() => thought.publishedAt, 'MMM DD YYYY', { locales: 'zh-Hans' }) }}
      </NuxtTime>
    </div>
  </article>
</template>
