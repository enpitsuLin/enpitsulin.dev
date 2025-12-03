<script setup lang="ts">
import type { Thought } from '~~/shared/types/thought'

definePageMeta({
  layout: 'home',
})

const THOUGHTS_LIMIT = 10
const thoughts = ref<Thought[]>([])
const nextCursor = ref<number | null>(null)
const isLoading = ref(false)
const loadMoreElement = ref<HTMLElement | null>(null)

async function loadThoughts(cursor: number | null = null) {
  if (isLoading.value)
    return

  isLoading.value = true
  try {
    const { data } = await $fetch<{ data: Thought[], nextCursor: number | null, limit: number }>('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
        ...(cursor && { cursor }),
      },
    })

    if (cursor) {
      thoughts.value.push(...data)
    }
    else {
      thoughts.value = data
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
  ([{ isIntersecting }]) => {
    if (isIntersecting && nextCursor.value && !isLoading.value) {
      loadThoughts(nextCursor.value)
    }
  },
)
</script>

<template>
  <HomePageContainer
    title="想法"
    description="一些零散的想法和思考"
  >
    <div v-if="thoughts.length > 0" pl="md:6" border="md:l border" w-full>
      <HomeThoughtTimeline :thoughts="thoughts" />
    </div>
    <div v-else-if="!isLoading">
      No Thoughts
    </div>

    <div
      v-if="nextCursor"
      ref="loadMoreElement"
      flex="~ items-center justify-center"
      py-8
    >
      <div v-if="isLoading" class="loader" />
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
