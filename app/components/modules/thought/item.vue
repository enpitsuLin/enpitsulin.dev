<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'

interface Props {
  thought: SerializeObject<Thought>
  isLast?: boolean
}

const { thought } = defineProps<Props>()
</script>

<template>
  <div relative pl="8 md:0" class="group">
    <!-- Timeline Line -->
    <div
      absolute bg="zinc-200/50 dark:zinc-800/50"
      class="left-10px md:left-136px top-2 w-px group-last:hidden bottom--7px"
    />

    <div flex="~ col md:row gap-4 md:gap-10" relative>
      <!-- Meta Info (Date & Time) -->
      <div
        flex="~ row md:col items-center md:items-end justify-between md:justify-start gap-1 shrink-0"
        class="md:w-32 md:text-right pt-1 pr-2"
      >
        <div class="flex items-center gap-3 md:flex-col md:gap-0.5">
          <NuxtTime
            month="short"
            day="2-digit"
            year="2-digit"
            time-zone="Asia/Shanghai"
            :datetime="thought.publishedAt"
            class="font-mono font-medium tracking-tight text-sm op-80"
          />
          <NuxtTime
            hour="2-digit"
            minute="2-digit"
            second="2-digit"
            time-zone="Asia/Shanghai"
            :datetime="thought.publishedAt"
            class="hidden md:block font-mono text-xs op-60"
          />
        </div>
      </div>

      <!-- Timeline Node (Dot) -->
      <div
        absolute
        class="left--21px md:left-[8.5rem] top-2 -translate-x-1/2 z-10 flex items-center justify-center"
      >
        <div
          size-2.5 border="2 zinc-50/50 dark:zinc-900/50 rounded-full"
          bg="zinc-800 group-hover:zinc-700 dark:zinc-600 dark:group-hover:zinc-400)"
          ring="1 zinc-200 dark:zinc-800"
          class="group-hover:scale-110 transition-all duration-300"
        />
      </div>

      <!-- Content Card -->
      <div flex-1 pb="10 md:16">
        <div
          relative
          bg="white dark:zinc-900 op-30 hover:op-50"
          border="~ border rounded-xl"
          class=" p-5 transition-all duration-300 shadow-sm group/card"
        >
          <!-- Header Row: Mood & Mobile Time -->
          <div flex="~ items-center gap-3" mb-3>
            <div
              v-if="thought.mood"
              flex="inline items-center"
              border="~ border rounded-full"
              un-text="xs"
              bg="zinc-200/80 dark:zinc-800/80"
              class="px-2.5 py-0.5 font-medium select-none"
            >
              {{ thought.mood }}
            </div>
            <NuxtTime
              hour="2-digit"
              minute="2-digit"
              second="2-digit"
              time-zone="Asia/Shanghai"
              :datetime="thought.publishedAt"
              class="md:hidden ml-auto font-mono text-xs op-80"
            />
          </div>
          <div un-text="sm" leading-relaxed>
            <MDCRenderer :body="thought.body" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
