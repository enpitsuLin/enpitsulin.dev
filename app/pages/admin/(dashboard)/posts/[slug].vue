<script setup lang="ts">
import type z from 'zod'
import type { postSchema } from '~~/shared/schema/post'
import { Dialog } from '@ark-ui/vue/dialog'
import { useToast } from '~/components/ui/toast/use-toast'

defineOptions({
  name: 'PostPage',
})

definePageMeta({
  layout: 'dashboard',
  breadcrumb: '编辑文章',
  middleware: ['auth'],
})

const toast = useToast()
const router = useRouter()

const route = useRoute('admin-posts-slug')

const slug = route.params.slug

// Fetch post data
const { data: post } = useAdminPostsSlugData()

const { mutate: updatePost, isLoading: isUpdating } = useMutation({
  async mutation(values: z.infer<typeof postSchema>) {
    const res = await $fetch(`/api/post/${slug}`, {
      method: 'PATCH',
      body: values,
    })
    return res
  },
  onSuccess() {
    toast.success({
      title: '成功',
      description: '文章已更新',
    })
    router.push('/admin/posts')
  },
  onError(error) {
    toast.error({
      title: '错误',
      description: error.message || '更新失败',
    })
  },
})

const initialValues = computed(() => {
  if (!post.value) {
    return {
      title: '',
      slug: '',
      content: '',
      tags: [],
      publishedAt: undefined,
    } satisfies z.infer<typeof postSchema>
  }
  return {
    title: post.value.title,
    slug: post.value.slug,
    description: post.value.description,
    content: post.value.content,
    tags: post.value.tags,
    publishedAt: post.value.publishedAt ? new Date(post.value.publishedAt) : undefined,
  } satisfies z.infer<typeof postSchema>
})

// Export functionality
const showExportDialog = ref(false)
const exportedMarkdown = ref('')
const isExporting = ref(false)

async function handleExport() {
  if (!slug)
    return

  isExporting.value = true
  try {
    const markdown = await $fetch(`/api/post/${slug}/export`, {
      method: 'GET',
    })
    exportedMarkdown.value = markdown as string
    showExportDialog.value = true
  }
  catch (error: any) {
    toast.error({
      title: '错误',
      description: error.message || '导出失败',
    })
  }
  finally {
    isExporting.value = false
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(exportedMarkdown.value)
    toast.success({
      title: '成功',
      description: '已复制到剪贴板',
    })
  }
  catch {
    toast.error({
      title: '错误',
      description: '复制失败',
    })
  }
}
</script>

<template>
  <div>
    <div flex="~ gap-4" px-4 mb-4>
      <UiButton
        :disabled="isExporting || !post"
        @click="handleExport"
      >
        {{ isExporting ? '导出中...' : '导出 Markdown' }}
      </UiButton>
    </div>
    <AdminPostForm
      :default-values="initialValues"
      :submitting="isUpdating"
      @submit="updatePost"
    />

    <!-- Export Dialog -->
    <Dialog.Root v-model:open="showExportDialog">
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
              <Dialog.CloseTrigger>
                <div class="i-mingcute:close-line size-4" />
              </Dialog.CloseTrigger>
              <h2 un-text="sm font-medium zinc-600 dark:zinc-400">
                导出 Markdown
              </h2>
            </div>
            <div
              relative
              border="~ border rounded-lg"
              bg="zinc-50 dark:zinc-950"
              p-4
              mb-4
            >
              <textarea
                :value="exportedMarkdown"
                readonly
                w="full"
                h="60vh"
                p-2
                border="none"
                bg="transparent"
                class="text-xs text-zinc-900 dark:text-zinc-100 font-mono resize-none outline-none"
                style="white-space: pre-wrap; word-wrap: break-word;"
              />
            </div>
            <div flex="~ gap-2 justify-end">
              <UiButton @click="copyToClipboard">
                复制
              </UiButton>
              <Dialog.CloseTrigger as-child>
                <UiButton>
                  关闭
                </UiButton>
              </Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Teleport>
    </Dialog.Root>
  </div>
</template>
