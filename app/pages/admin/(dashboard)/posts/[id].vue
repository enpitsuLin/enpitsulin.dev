<script setup lang="ts">
import type z from 'zod'
import type { postSchema } from '~~/shared/schema/post'
import { useToast } from '~/components/ui/toast/use-toast'

defineOptions({
  name: 'PostPage',
})

definePageMeta({
  layout: 'dashboard',
  breadcrumb: '编辑文章',
})

const toast = useToast()
const router = useRouter()

const route = useRoute('admin-posts-id')

const postId = route.params.id

// Fetch post data
const { data: post } = useAsyncData(
  `admin-post-${postId}`,
  async () => {
    const res = await $fetch(`/api/post/${postId}`)
    return res
  },
)

const { mutate: updatePost, isLoading: isUpdating } = useMutation({
  async mutation(values: z.infer<typeof postSchema>) {
    const res = await $fetch(`/api/post/${postId}`, {
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
      status: 'draft',
      tags: [],
      publishedAt: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    } satisfies z.infer<typeof postSchema>
  }
  return {
    title: post.value.title,
    slug: post.value.slug,
    excerpt: post.value.excerpt ?? undefined,
    content: post.value.content,
    status: post.value.status,
    tags: post.value.tags.map(t => t.name),
    publishedAt: post.value.publishedAt ? new Date(post.value.publishedAt) : undefined,
    createdAt: post.value.createdAt ? new Date(post.value.createdAt) : undefined,
    updatedAt: post.value.updatedAt ? new Date(post.value.updatedAt) : undefined,
  } satisfies z.infer<typeof postSchema>
})
</script>

<template>
  <AdminPostForm
    :default-values="initialValues"
    :submitting="isUpdating"
    @submit="updatePost"
  />
</template>
