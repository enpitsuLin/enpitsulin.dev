<script setup lang="ts">
import type z from 'zod'
import { Dialog } from '@ark-ui/vue/dialog'
import { useInfiniteQuery } from '@pinia/colada'
import { useForm } from '@tanstack/vue-form'
import { thoughtSchema } from '~~/shared/schema/thought'
import { useToast } from '~/components/ui/toast/use-toast'
import { validatorsFromSchema } from '~/composables/form'

definePageMeta({
  loaders: [useThoughts],
  layout: 'home',
})

const { data: initialThoughts } = useThoughts()

type ThoughtResponse = Awaited<ReturnType<typeof useThoughts>>

const { data: thoughtsData, loadNextPage, asyncStatus, hasNextPage } = useInfiniteQuery({
  key: ['thoughts', 'infinite-load'],
  async query(context) {
    const cursor = context.pageParam
    // 如果 cursor 为 null，说明是第一页，返回预加载的数据
    if (cursor === null) {
      return initialThoughts.value
    }
    // 否则从服务器获取数据
    return $fetch('/api/thought', {
      query: {
        limit: THOUGHTS_LIMIT,
        cursor,
      },
    })
  },
  initialPageParam: null as number | null,
  getNextPageParam: (lastPage) => {
    // 如果 lastPage 有 nextCursor，返回它作为下一页参数；否则返回 null 表示没有更多页面
    return lastPage?.nextCursor ?? null
  },
})

const thoughts = computed(() => {
  // 新版本中，thoughtsData.value 结构是 { pages: TData[], pageParams: TPageParam[] }
  // pages 包含所有页面的数据（包括第一页的预加载数据）
  const pages = thoughtsData.value?.pages ?? []
  return pages.flatMap(page => page.data)
})

onMounted(() => {
  useInfiniteScroll(
    window,
    async () => {
      await loadNextPage()
    },
    {
      distance: 200,
      canLoadMore: () => {
        return hasNextPage.value && asyncStatus.value !== 'loading'
      },
    },
  )
})

const queryCache = useQueryCache()
const toast = useToast()

const showModal = ref(false)

const { mutateAsync: postThought } = useMutation({
  mutation(vars: Pick<Thought, 'mood' | 'content'>) {
    return $fetch('/api/thought', { method: 'POST', body: vars })
  },
  async onMutate(vars) {
    // 获取当前的无限查询数据
    const oldData = queryCache.getQueryData<{
      pages: ThoughtResponse[]
      pageParams: (number | null)[]
    }>(['thoughts', 'infinite-load'])!

    const parsed = await parseMarkdown(vars.content)
    const newThought: ThoughtResponse['data'][number] = {
      ...vars,
      id: crypto.randomUUID(),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      body: parsed.body,
    }

    // 创建新的数据对象以保持不可变性
    const newData = {
      pages: [...oldData.pages],
      pageParams: [...oldData.pageParams],
    }

    // 将新想法添加到第一页的开头
    const firstPage = { ...newData.pages[0]! }
    firstPage.data = [newThought, ...firstPage.data]
    newData.pages[0] = firstPage

    // 更新缓存
    queryCache.setQueryData(['thoughts', 'infinite-load'], newData)

    return {
      oldData,
      newThought,
    }
  },
})

const DEFAULT_VALUES: z.infer<typeof thoughtSchema> = {
  content: '',
  mood: '',
}

const form = useForm({
  defaultValues: DEFAULT_VALUES,
  validators: validatorsFromSchema(thoughtSchema, 'submit'),
  onSubmit: async ({ value }) => {
    try {
      await postThought({
        content: value.content,
        mood: value.mood || null,
      })
      toast.success({
        title: '成功',
        description: '想法已发表',
      })
      showModal.value = false
      form.reset()
    }
    catch (error: any) {
      toast.error({
        title: '错误',
        description: error.message || '发表失败',
      })
    }
  },
})

const submitting = computed(() => form.state.isSubmitting)

function onAdd() {
  showModal.value = true
}

function onClose() {
  showModal.value = false
  form.reset()
}
</script>

<template>
  <HomePageContainer
    title="想法"
    description="这里记录着一些稍纵即逝的灵感、技术碎片以及生活中的碎碎念。比起完整的文章，这里更像是一个公开的备忘录"
  >
    <div v-if="$user?.role === 'admin'" flex="~ justify-center gap-2" py-2 w-full>
      <UiButton @click="onAdd">
        发表一条新的想法
      </UiButton>
    </div>

    <!-- Add Thought Modal -->
    <ClientOnly>
      <Dialog.Root v-model:open="showModal">
        <Teleport to="#teleports">
          <Dialog.Backdrop
            bg="zinc-800/40 dark:bg-black/40"
            class="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          />
          <Dialog.Positioner>
            <Dialog.Content
              class="fixed inset-x-4 top-8 z-100 max-h-[80vh] origin-top rounded-3xl from-zinc-100/75 to-white bg-gradient-to-b p-8 ring-1 ring-zinc-900/5 dark:from-zinc-900/50 dark:to-zinc-900 dark:ring-zinc-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
            >
              <div flex="~ row-reverse items-center justify-between" mb-4>
                <Dialog.CloseTrigger @click="onClose">
                  <div class="i-mingcute:close-line size-4" />
                </Dialog.CloseTrigger>
                <h2 un-text="sm font-medium zinc-600 dark:zinc-400">
                  发表新想法
                </h2>
              </div>
              <div role="form" space-y-4>
                <form.Field
                  v-slot="{ field }"
                  name="mood"
                >
                  <UiFormField
                    v-slot="{ value, onInput, onBlur }"
                    :field
                    label="心情 (Emoji)"
                  >
                    <input
                      :value="value"
                      type="text"
                      w="full" p="x4 y2"
                      border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
                      bg="transparent"
                      :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
                      class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
                      placeholder="😊"
                      @input="onInput"
                      @blur="onBlur"
                    >
                  </UiFormField>
                </form.Field>
                <form.Field
                  v-slot="{ field }"
                  name="content"
                >
                  <UiFormField
                    v-slot="{ value, onInput, onBlur }"
                    :field
                    label="内容"
                  >
                    <textarea
                      :value="value"
                      rows="8"
                      w="full" p="x4 y2"
                      border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
                      bg="transparent"
                      :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
                      class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400 resize-none"
                      placeholder="写下你的想法..."
                      @input="onInput"
                      @blur="onBlur"
                    />
                  </UiFormField>
                </form.Field>
              </div>
              <div flex="~ gap-2 justify-end" mt-6>
                <UiButton variant="ghost" @click="onClose">
                  取消
                </UiButton>
                <UiButton :disabled="submitting" @click="() => form.handleSubmit()">
                  {{ submitting ? '发表中...' : '发表' }}
                </UiButton>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Teleport>
      </Dialog.Root>
    </ClientOnly>
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
        v-if="!hasNextPage && asyncStatus !== 'loading'" flex="~ items-center gap-4" un-text="zinc-400 dark:zinc-700"
        class=" w-full justify-center opacity-60"
      >
        <span class="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
        <span class="text-xs font-mono">碳基生命的灵感终有尽头</span>
        <span class="h-px w-12 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  </HomePageContainer>
</template>
