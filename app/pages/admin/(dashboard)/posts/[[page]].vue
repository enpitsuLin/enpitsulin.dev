<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog'
import { useToast } from '~/components/ui/toast/use-toast'

defineOptions({
  name: 'PostsPage',
})

definePageMeta({
  alias: '/admin/posts/:page(\\d+)?',
  layout: 'dashboard',
  breadcrumb: '文章管理',
  middleware: ['auth'],
})

const router = useRouter()
const toast = useToast()
const route = useRoute('admin-posts-page')

const page = computed<number>(() => route.params.page ? Number.parseInt(route.params.page as string) : 0)

const { data: posts, status, refresh } = useAdminPostsData()

// Import functionality
const showImportDialog = ref(false)
const importMarkdown = ref('')

const { mutate: deletePost, isLoading: isDeleting } = useMutation({
  mutation(postId: string) {
    return $fetch(`/api/post/${postId}`, { method: 'DELETE' })
  },
  onSuccess() {
    // Refresh the current page data
    refresh()
    toast.success({
      title: '成功',
      description: '文章已删除',
    })
  },
  onError(error) {
    toast.error({
      title: '错误',
      description: error.message || '删除失败',
    })
  },
})

const { mutate: importPost, isLoading: isImporting } = useMutation({
  async mutation(markdown: string) {
    return $fetch('/api/post/import', {
      method: 'POST',
      body: { markdown },
    })
  },
  onSuccess() {
    refresh()
    toast.success({
      title: '成功',
      description: '文章已导入',
    })
    showImportDialog.value = false
    importMarkdown.value = ''
  },
  onError(error: any) {
    toast.error({
      title: '错误',
      description: error.message || '导入失败',
    })
  },
})

function handleEdit(id: string) {
  router.push(`/admin/posts/${id}`)
}

const showDeleteConfirm = ref(false)
const postToDelete = ref<string | null>(null)

function handleDelete(id: string) {
  postToDelete.value = id
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (postToDelete.value) {
    deletePost(postToDelete.value)
    showDeleteConfirm.value = false
    postToDelete.value = null
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  postToDelete.value = null
}

function handleNew() {
  router.push('/admin/posts/create')
}

function formatDate(date: number | Date | string | null | undefined) {
  if (!date)
    return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function handleImport() {
  showImportDialog.value = true
}

function handleImportSubmit() {
  if (!importMarkdown.value.trim()) {
    toast.error({
      title: '错误',
      description: '请粘贴 Markdown 内容',
    })
    return
  }
  importPost(importMarkdown.value)
}

function cancelImport() {
  showImportDialog.value = false
  importMarkdown.value = ''
}
</script>

<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>文章列表</h1>
      <div style="display: flex; gap: 8px;">
        <button @click="handleImport">
          导入 Markdown
        </button>
        <button @click="handleNew">
          新建文章
        </button>
      </div>
    </div>

    <div v-if="status === 'pending'">
      加载中...
    </div>
    <div v-else-if="posts && posts.data.length > 0">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">
              标题
            </th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">
              Slug
            </th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">
              发布时间
            </th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">
              更新时间
            </th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts.data" :key="post.slug">
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ post.title }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ post.slug }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ formatDate(post.publishedAt) }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ formatDate(post.updatedAt) }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              <button style="margin-right: 8px;" @click="handleEdit(post.slug)">
                编辑
              </button>
              <button :disabled="isDeleting" @click="handleDelete(post.slug)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      暂无文章
    </div>

    <RouterLink v-if="page > 0" :to="page - 1 > 0 ? `/admin/posts/${page - 1}` : '/admin/posts'">
      上一页
    </RouterLink>
    <RouterLink v-if="posts?.total && (posts.total > posts.offset + posts.limit)" :to="`/admin/posts/${page + 1}`">
      下一页
    </RouterLink>

    <!-- Delete confirmation dialog -->
    <div
      v-if="showDeleteConfirm"
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;"
      @click="cancelDelete"
    >
      <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px;" @click.stop>
        <h3 style="margin-top: 0;">
          确认删除
        </h3>
        <p>确定要删除这篇文章吗？此操作不可恢复。</p>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
          <button
            style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="cancelDelete"
          >
            取消
          </button>
          <button
            style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
            @click="confirmDelete"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- Import Dialog -->
    <Dialog.Root v-model:open="showImportDialog">
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
              <Dialog.CloseTrigger @click="cancelImport">
                <div class="i-mingcute:close-line size-4" />
              </Dialog.CloseTrigger>
              <h2 un-text="sm font-medium zinc-600 dark:zinc-400">
                导入 Markdown
              </h2>
            </div>
            <div mb-4>
              <label
                block
                mb-2
                un-text="xs font-medium zinc-700 dark:zinc-300"
              >
                粘贴包含 frontmatter 的 Markdown 内容
              </label>
              <textarea
                v-model="importMarkdown"
                w="full"
                h="50vh"
                p-4
                border="~ border rounded-lg"
                bg="zinc-50 dark:zinc-950"
                class="text-xs text-zinc-900 dark:text-zinc-100 font-mono resize-none outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="---&#10;title: 文章标题&#10;slug: article-slug&#10;tags: [tag1, tag2]&#10;publishedAt: '2024-01-01T00:00:00.000Z'&#10;---&#10;&#10;文章内容..."
              />
            </div>
            <div flex="~ gap-2 justify-end">
              <UiButton @click="cancelImport">
                取消
              </UiButton>
              <UiButton
                :disabled="isImporting"
                @click="handleImportSubmit"
              >
                {{ isImporting ? '导入中...' : '导入' }}
              </UiButton>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Teleport>
    </Dialog.Root>
  </div>
</template>
