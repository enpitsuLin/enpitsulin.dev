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
  middleware: ['auth'],
})

const toast = useToast()
const router = useRouter()

const route = useRoute('admin-posts-slug')

const slug = route.params.slug

// Fetch post data
const { data: post } = useFetch(`/api/post/${slug}`)

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
</script>

<template>
  <AdminPostForm
    :default-values="initialValues"
    :submitting="isUpdating"
    @submit="updatePost"
  />
</template>
