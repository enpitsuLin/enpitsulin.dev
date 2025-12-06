<script setup lang="ts">
import { useInfiniteQuery } from '@pinia/colada'

definePageMeta({
  loaders: [useThoughts],
  layout: 'home',
})

const initialThoughts = await useThoughts()

const {
  state: thoughts,
  loadMore,
  asyncStatus,
} = useInfiniteQuery({
  key: ['thoughts', 'infinite-load'],
  async query({ nextCursor }) {
    if (!nextCursor)
      return null
    return $fetch('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
        ...(nextCursor && { cursor: nextCursor }),
      },
    })
  },
  initialPage: initialThoughts,
  merge(data, newThoughts) {
    if (!newThoughts)
      return data
    return {
      data: data.data.concat(newThoughts.data),
      nextCursor: newThoughts.nextCursor,
      limit: data.limit,
    }
  },
})

onMounted(() => {
  useInfiniteScroll(
    window,
    async () => {
      await loadMore()
    },
    {
      distance: 200,
      canLoadMore: () => {
        return !!thoughts.value.data.nextCursor && asyncStatus.value !== 'loading'
      },
    },
  )
})

const queryCache = useQueryCache()
function onAdd() {
  thoughts.value?.data.data.unshift({
    id: window.crypto.randomUUID(),
    content: `test${window.crypto.randomUUID()}`,
    mood: 'test',
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    body: {
      type: 'root',
      children: [
        {
          type: 'text',
          value: `test${window.crypto.randomUUID()}`,
        },
      ],
    },
  })
}

function onClear() {
  queryCache.invalidateQueries({
    key: ['thoughts', 'infinite-load'],
  })
}
</script>

<template>
  <HomePageContainer
    title="想法"
    description="这里记录着一些稍纵即逝的灵感、技术碎片以及生活中的碎碎念。比起完整的文章，这里更像是一个公开的备忘录"
  >
    <div v-if="$user?.role === 'admin'" flex="~ gap-2">
      <UiButton
        @click="() => {
          console.log(queryCache.getQueryData(['thoughts']))
        }"
      >
        debug
      </UiButton>
      <UiButton @click="onClear">
        清空缓存
      </UiButton>
      <UiButton @click="onAdd">
        发表一条新的想法
      </UiButton>
    </div>
    <ThoughtList>
      <ThoughtItem
        v-for="(thought, index) in thoughts.data.data || []"
        :key="thought.id"
        :delay="(index % THOUGHTS_LIMIT) * 0.1"
        :thought="thought"
      />
      <template #append>
        <div v-if="thoughts?.data.data.length === 0">
          <ListEmpty type="thoughts" />
        </div>
      </template>
    </ThoughtList>

    <div
      v-if="thoughts && thoughts.data.data.length > 0"
      flex="~ flex-col items-center justify-center "
      class="py-4 min-h-[80px]"
    >
      <div
        v-if="asyncStatus === 'loading'"
        bg="dark:zinc-900/50"
        border="~ dark:zinc-800 rounded-full"
        flex="~ items-center gap-3"
        class="px-4 py-2 text-zinc-500 animate-in fade-in zoom-in duration-200"
      >
        <i class="i-mingcute:loading-line w-4 h-4 animate-spin" />
        <span class="text-xs font-medium">加载更多...</span>
      </div>
      <div
        v-if="!thoughts.data.nextCursor && asyncStatus !== 'loading'"
        flex="~ items-center gap-4"
        un-text="zinc-400 dark:zinc-700"
        class=" w-full justify-center opacity-60"
      >
        <span class="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
        <span class="text-xs font-mono">碳基生命的灵感终有尽头</span>
        <span class="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  </HomePageContainer>
</template>
