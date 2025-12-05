<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'

definePageMeta({
  layout: 'home',
})

const THOUGHTS_LIMIT = 8

const _thoughts = useState<SerializeObject<Thought>[]>('thoughts', () => [])
const nextCursor = useState<number | null>('thoughts.nextCursor', () => null)

const { data: thoughts, pending, refresh } = await useAsyncData(
  'thoughts',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const data = await $fetch('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
        ...(nextCursor.value && { cursor: nextCursor.value }),
      },
    })

    nextCursor.value = data.nextCursor

    _thoughts.value.push(...data.data)

    return _thoughts.value as SerializeObject<Thought>[]
  },
)

onMounted(() => {
  useInfiniteScroll(
    window,
    async () => {
      await refresh()
    },
    {
      distance: 100,
      canLoadMore: () => {
        return !!nextCursor.value && !pending.value
      },
    },
  )
})
</script>

<template>
  <HomePageContainer
    title="想法"
    description="这里记录着一些稍纵即逝的灵感、技术碎片以及生活中的碎碎念。比起完整的文章，这里更像是一个公开的备忘录"
  >
    <div
      border="~ red px"
      class="relative w-full"
    >
      <ThoughtItem
        v-for="(thought, index) in thoughts || []"
        :key="thought.id"
        :thought="thought"
        :is-last="index === (thoughts?.length || 0) - 1"
      />
    </div>

    <div
      class="py-4 flex flex-col items-center justify-center min-h-[80px]"
    >
      <div
        v-if="pending"
        class="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 animate-in fade-in zoom-in duration-200"
      >
        <i class="i-mingcute:loading-line w-4 h-4 animate-spin" />
        <span class="text-xs font-medium">加载更多...</span>
      </div>
      <div
        v-if="!nextCursor && !pending"
        class="flex items-center gap-4 text-zinc-700 w-full justify-center opacity-60"
      >
        <span class="h-px w-12 bg-zinc-800" />
        <span class="text-xs font-mono">碳基生命的灵感终有尽头</span>
        <span class="h-px w-12 bg-zinc-800" />
      </div>
    </div>
  </HomePageContainer>
</template>
