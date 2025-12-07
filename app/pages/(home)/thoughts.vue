<script setup lang="ts">
import { useInfiniteQuery } from '@pinia/colada'

definePageMeta({
  loaders: [useThoughts],
  layout: 'home',
})

const { data: initialThoughts } = useThoughts()

type ThoughtResponse = Awaited<ReturnType<typeof useThoughts>>

interface InfiniteLoadData {
  pages: ThoughtResponse[]
  pagesMap: Map<number, ThoughtResponse>
  nextCursor: number | null
}

const { data: thoughtsData, loadMore, asyncStatus } = useInfiniteQuery({
  key: ['thoughts', 'infinite-load'],
  async query(page) {
    const nextCursor = page?.nextCursor
    if (!nextCursor)
      return null
    return $fetch('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
        ...(nextCursor && { cursor: nextCursor }),
      },
    })
  },
  initialPage: {
    pages: [initialThoughts.value] as ThoughtResponse[],
    pagesMap: new Map<number, ThoughtResponse>([
      [0, initialThoughts.value],
    ]),
    nextCursor: initialThoughts.value.nextCursor,
  } as InfiniteLoadData,
  merge(data, newThoughts) {
    if (newThoughts) {
      const lastPage = data.pages.at(-1)!
      data.pages.push(newThoughts)
      if (lastPage.nextCursor)
        data.pagesMap.set(lastPage.nextCursor, newThoughts)
    }
    data.nextCursor = newThoughts?.nextCursor ?? null
    return data
  },
})

const thoughts = computed(() => {
  return thoughtsData.value?.pages.flatMap(page => page.data)
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
        return !!thoughtsData.value?.nextCursor && asyncStatus.value !== 'loading'
      },
    },
  )
})

const queryCache = useQueryCache()

const { mutateAsync: postThought } = useMutation({
  mutation(vars: Pick<Thought, 'mood' | 'content'>) {
    return $fetch('/api/thought', { method: 'POST', body: vars })
  },
  async onMutate(vars) {
    const oldData = queryCache.getQueryData<InfiniteLoadData>(['thoughts', 'infinite-load'])!
    const parsed = await parseMarkdown(vars.content)
    const newThought: ThoughtResponse['data'][number] = {
      ...vars,
      id: crypto.randomUUID(),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      body: parsed.body,
    }

    const firstPage = oldData.pages[0]!
    firstPage.data.unshift(newThought)
    oldData.pagesMap.set(0, firstPage)

    queryCache.setQueryData(['thoughts', 'infinite-load'], oldData)

    triggerRef(thoughtsData)

    return {
      oldData,
      newThought,
    }
  },
})

function onAdd() {
  const insert = {
    content: `test${window.crypto.randomUUID()}`,
    mood: 'test',
  }
  postThought(insert)
}

function onClear() {
  queryCache.invalidateQueries({
    key: ['thoughts', 'infinite-load'],
  })
}

function onDebug() {
  // eslint-disable-next-line no-console
  console.log(queryCache.getQueryData(['thoughts', 'infinite-load']))
}
</script>

<template>
  <HomePageContainer
    title="想法"
    description="这里记录着一些稍纵即逝的灵感、技术碎片以及生活中的碎碎念。比起完整的文章，这里更像是一个公开的备忘录"
  >
    <div v-if="$user?.role === 'admin'" flex="~ gap-2">
      <UiButton @click="onDebug">
        debug
      </UiButton>
      <UiButton @click="onClear">
        清空缓存
      </UiButton>
      <UiButton @click="onAdd">
        发表一条新的想法
      </UiButton>
    </div>
    <ThoughtList :thoughts="thoughts || []">
      <template #default="{ thought, index }">
        <ThoughtItem
          :delay="(index % THOUGHTS_LIMIT) * 0.1"
          :thought="thought"
        />
      </template>
      <template #append>
        <div v-if="thoughts.length === 0">
          <ListEmpty type="thoughts" />
        </div>
      </template>
    </ThoughtList>

    <div
      v-if="thoughts && thoughts.length > 0" flex="~ flex-col items-center justify-center "
      class="py-4 min-h-[80px]"
    >
      <div
        v-if="asyncStatus === 'loading'" bg="dark:zinc-900/50" border="~ dark:zinc-800 rounded-full"
        flex="~ items-center gap-3" class="px-4 py-2 text-zinc-500 animate-in fade-in zoom-in duration-200"
      >
        <i class="i-mingcute:loading-line w-4 h-4 animate-spin" />
        <span class="text-xs font-medium">加载更多...</span>
      </div>
      <div
        v-if="!thoughtsData.nextCursor && asyncStatus !== 'loading'" flex="~ items-center gap-4" un-text="zinc-400 dark:zinc-700"
        class=" w-full justify-center opacity-60"
      >
        <span class="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
        <span class="text-xs font-mono">碳基生命的灵感终有尽头</span>
        <span class="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  </HomePageContainer>
</template>
