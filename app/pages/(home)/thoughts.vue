<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'

definePageMeta({
  layout: 'home',
})

const THOUGHTS_LIMIT = 5
const thoughts = ref<SerializeObject<Thought>[]>([])
const nextCursor = ref<number | null>(null)
const isLoading = ref(false)
const loadMoreElement = ref<HTMLElement | null>(null)
const wasIntersecting = ref(false)

async function loadThoughts(cursor: number | null = null) {
  if (isLoading.value)
    return

  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 1000))
  try {
    const data = await $fetch('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
        ...(cursor && { cursor }),
      },
    })

    if (cursor) {
      thoughts.value.push(...data.data)
    }
    else {
      thoughts.value = data.data
    }
    nextCursor.value = data.nextCursor
  }
  finally {
    isLoading.value = false
  }
}

// Initial load
await loadThoughts()

// Infinite scroll with intersection observer
useIntersectionObserver(
  loadMoreElement,
  ([entry]) => {
    const isIntersecting = entry?.isIntersecting ?? false

    // Only trigger load when element transitions from not visible to visible
    // This prevents multiple triggers when element stays in viewport
    if (isIntersecting && !wasIntersecting.value && nextCursor.value && !isLoading.value) {
      loadThoughts(nextCursor.value)
    }

    // Update the previous state
    wasIntersecting.value = isIntersecting
  },
  {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  },
)
</script>

<template>
  <HomePageContainer
    title="想法"
    description="这里记录着一些稍纵即逝的灵感、技术碎片以及生活中的碎碎念。比起完整的文章，这里更像是一个公开的备忘录"
  >
    <div v-if="thoughts.length > 0" class="relative w-full">
      <ThoughtItem
        v-for="(thought, index) in thoughts"
        :key="thought.id"
        :thought="thought"
        :is-last="index === thoughts.length - 1"
      />
    </div>

    <div
      ref="loadMoreElement"
      class="py-4 flex flex-col items-center justify-center min-h-[80px]"
    >
      <div
        v-if="isLoading"
        class="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 animate-in fade-in zoom-in duration-300"
      >
        <i class="i-mingcute:loading-line w-4 h-4 animate-spin" />
        <span class="text-xs font-medium">加载更多...</span>
      </div>
      <div
        v-if="!nextCursor && !isLoading"
        class="flex items-center gap-4 text-zinc-700 w-full justify-center opacity-60"
      >
        <span class="h-px w-12 bg-zinc-800" />
        <span class="text-xs font-mono">碳基生命的灵感终有尽头</span>
        <span class="h-px w-12 bg-zinc-800" />
      </div>
    </div>
  </HomePageContainer>
</template>

<style>
.loader {
  width: 48px;
  height: 48px;
  display: inline-block;
  position: relative;
}
.loader::after,
.loader::before {
  content: '';
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  left: 0;
  top: 0;
  animation: animloader 2s linear infinite;
}
.loader::after {
  animation-delay: 1s;
}

@keyframes animloader {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>
