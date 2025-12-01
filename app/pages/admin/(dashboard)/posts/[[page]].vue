<script setup lang="ts">
import { useToast } from '~/components/ui/toast/use-toast'

defineOptions({
  name: 'PostsPage',
})

definePageMeta({
  alias: '/admin/posts/:page(\\d+)',
  layout: 'dashboard',
  breadcrumb: '文章管理',
})

const router = useRouter()
const toast = useToast()
const queryCache = useQueryCache()
const route = useRoute('admin-posts-page')

const page = computed<number>(() => route.params.page ? Number.parseInt(route.params.page as string) : 0)

const { data: posts, status } = useAsyncData(
  `admin-posts-page-${page.value}`,
  async () => {
    const response = await $fetch('/api/post', { query: { limit: 10, offset: (page.value - 1) * 10 } })
    return response
  },
  { watch: [page] },
)

const { mutate: deletePost, isLoading: isDeleting } = useMutation({
  mutation(postId: string) {
    // @ts-expect-error ignore
    return $fetch(`/api/post/${postId}`, { method: 'DELETE' })
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['posts', 'list'] })
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
</script>

<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>文章列表</h1>
      <button @click="handleNew">
        新建文章
      </button>
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
              状态
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
          <tr v-for="post in posts.data" :key="post.id">
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ post.title }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ post.slug }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ post.status }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ formatDate(post.publishedAt) }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              {{ formatDate(post.updatedAt) }}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              <button style="margin-right: 8px;" @click="handleEdit(post.id)">
                编辑
              </button>
              <button :disabled="isDeleting" @click="handleDelete(post.id)">
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

    <RouterLink
      v-if="page > 0" :to="page - 1 > 0 ? `/admin/posts/${page - 1}` : '/admin/posts'"
    >
      上一页
    </RouterLink>
    <RouterLink
      v-if="posts?.total && (posts.total > posts.offset + posts.limit)" :to="`/admin/posts/${page + 1}`"
    >
      下一页
    </RouterLink>

    <!-- Delete confirmation dialog -->
    <div
      v-if="showDeleteConfirm"
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;"
      @click="cancelDelete"
    >
      <div
        style="background: white; padding: 20px; border-radius: 8px; max-width: 400px;"
        @click.stop
      >
        <h3 style="margin-top: 0;">
          确认删除
        </h3>
        <p>确定要删除这篇文章吗？此操作不可恢复。</p>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
          <button style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="cancelDelete">
            取消
          </button>
          <button style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="confirmDelete">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
