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
const toast = useToast()

const showModal = ref(false)

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
    <div v-if="$user?.role === 'admin'" flex="~ gap-2">
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
