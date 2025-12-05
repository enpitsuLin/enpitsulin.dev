<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'

interface Props {
  thought: SerializeObject<Thought>
  isLast?: boolean
}

const { thought, isLast = false } = defineProps<Props>()
</script>

<template>
  <div relative pl="8 md:0" class="group">
    <!-- Timeline Line (Desktop) -->
    <div
      class="absolute left-0 md:left-[8.5rem] top-2 w-px bg-zinc-800/50 hidden md:block"
      :class="isLast ? 'h-0' : 'bottom-0'"
      :style="{
        bottom: isLast ? 'auto' : '0',
        height: isLast ? '20px' : 'auto',
      }"
    />

    <!-- Timeline Line (Mobile) -->
    <div
      absolute
      class="left-[11px] top-2 w-px bg-zinc-800/50 md:hidden"
      :class="isLast ? 'h-0' : 'bottom-0'"
      :style="{
        bottom: isLast ? 'auto' : '0',
        height: isLast ? '20px' : 'auto',
      }"
    />

    <div flex="~ col md:row gap-4 md:gap-10" relative>
      <!-- Meta Info (Date & Time) -->
      <div
        flex="~ row md:col items-center md:items-end justify-between md:justify-start gap-1 shrink-0"
        class="md:w-32 md:text-right pt-1"
      >
        <div class="flex items-center gap-3 md:flex-col md:gap-0.5">
          <NuxtTime
            month="short"
            day="2-digit"
            year="2-digit"
            time-zone="Asia/Shanghai"
            :datetime="thought.publishedAt"
            class="text-zinc-400 font-mono text-sm font-medium tracking-tight"
          />
          <NuxtTime
            hour="2-digit"
            minute="2-digit"
            time-zone="Asia/Shanghai"
            :datetime="thought.publishedAt"
            class="text-zinc-600 text-xs hidden md:block font-mono"
          />
        </div>
      </div>

      <!-- Timeline Node (Dot) -->
      <div
        absolute
        class="left--21px md:left-[8.5rem] top-[0.45rem] -translate-x-1/2 z-10 flex items-center justify-center"
      >
        <div
          size-2.5 border="2 [#050505] rounded-full"
          class=" bg-zinc-600 ring-1 ring-zinc-800 group-hover:bg-zinc-400 group-hover:scale-110 transition-all duration-300"
        />
      </div>

      <!-- Content Card -->
      <div flex-1 pb-10>
        <div
          relative
          bg="zinc-900/30 hover:zinc-900/50 "
          border="~ zinc-800/50 hover:zinc-700/60  rounded-xl"
          class=" p-5 transition-all duration-300 shadow-sm group/card"
        >
          <!-- Header Row: Mood & Mobile Time -->
          <div flex="~ items-center gap-3" mb-3>
            <div
              v-if="thought.mood"
              flex="inline items-center"
              border="~ zinc-700/50 rounded-full"
              un-text="xs zinc-400"
              class="px-2.5 py-0.5 bg-zinc-800/80 font-medium select-none"
            >
              {{ thought.mood }}
            </div>
            <NuxtTime
              hour="2-digit"
              minute="2-digit"
              time-zone="Asia/Shanghai"
              :datetime="thought.publishedAt"
              un-text="xs zinc-600"
              class="md:hidden ml-auto font-mono"
            />
          </div>
          <div text-sm text-zinc-300 leading-relaxed>
            <MDCRenderer :body="thought.body" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
