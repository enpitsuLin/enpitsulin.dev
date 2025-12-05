<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'
import { h } from 'vue'

interface Props {
  thought: SerializeObject<Thought>
  isLast?: boolean
}

const { thought, isLast = false } = defineProps<Props>()

// Format date and time from publishedAt
const formattedDate = computed(() => {
  return useDateFormat(() => thought.publishedAt, 'MMM DD YYYY', { locales: 'zh-Hans' })
})

const formattedTime = computed(() => {
  return useDateFormat(() => thought.publishedAt, 'HH:mm', { locales: 'zh-Hans' })
})

// Simple helper to process basic markdown syntax for display
function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line) {
      return h('div', { key: i, class: 'h-4' })
    }

    // Blockquote
    if (line.startsWith('> ')) {
      return h(
        'blockquote',
        {
          key: i,
          class: 'border-l-2 border-zinc-700 pl-4 py-1 my-2 text-zinc-500 italic',
        },
        line.replace('> ', ''),
      )
    }

    // Bold and code processing
    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g)
    return h(
      'p',
      {
        key: i,
        class: 'mb-1 leading-7 text-zinc-300',
      },
      parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return h(
            'strong',
            {
              key: j,
              class: 'font-semibold text-zinc-200',
            },
            part.slice(2, -2),
          )
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return h(
            'code',
            {
              key: j,
              class: 'bg-zinc-800/80 px-1.5 py-0.5 rounded text-xs text-amber-500/90 font-mono border border-zinc-800',
            },
            part.slice(1, -1),
          )
        }
        return part
      }),
    )
  })
}

const ContentRenderer = () => renderContent(thought.content)
</script>

<template>
  <div class="relative pl-8 md:pl-0 group">
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
      class="absolute left-[11px] top-2 w-px bg-zinc-800/50 md:hidden"
      :class="isLast ? 'h-0' : 'bottom-0'"
      :style="{
        bottom: isLast ? 'auto' : '0',
        height: isLast ? '20px' : 'auto',
      }"
    />

    <div class="flex flex-col md:flex-row gap-4 md:gap-10 relative">
      <!-- Meta Info (Date & Time) -->
      <div class="md:w-32 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-1 shrink-0 md:text-right pt-1">
        <div class="flex items-center gap-3 md:flex-col md:gap-0.5">
          <span class="text-zinc-400 font-mono text-sm font-medium tracking-tight">
            {{ formattedDate }}
          </span>
          <span class="text-zinc-600 text-xs hidden md:block font-mono">
            {{ formattedTime }}
          </span>
        </div>
      </div>

      <!-- Timeline Node (Dot) -->
      <div class="absolute left-[11px] md:left-[8.5rem] top-[0.45rem] -translate-x-1/2 z-10 flex items-center justify-center">
        <div class="w-2.5 h-2.5 rounded-full bg-zinc-600 border-2 border-[#050505] ring-1 ring-zinc-800 group-hover:bg-zinc-400 group-hover:scale-110 transition-all duration-300" />
      </div>

      <!-- Content Card -->
      <div class="flex-1 pb-10">
        <div class="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-xl hover:bg-zinc-900/50 hover:border-zinc-700/60 transition-all duration-300 shadow-sm relative group/card">
          <!-- Header Row: Mood & Mobile Time -->
          <div class="flex items-center gap-3 mb-3">
            <div
              v-if="thought.mood"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-400 font-medium select-none"
            >
              {{ thought.mood }}
            </div>
            <div class="md:hidden ml-auto text-xs text-zinc-600 font-mono">
              {{ formattedTime }}
            </div>
          </div>
          <div class="text-sm md:text-base text-zinc-300 leading-relaxed">
            <ContentRenderer />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
