<script setup lang="ts">
import type z from 'zod'
import type { postSchema } from '~~/shared/schema/post'
import { useToast } from '~/components/ui/toast/use-toast'

defineOptions({
  name: 'NewPostPage',
})

definePageMeta({
  breadcrumb: '新建',
  layout: 'dashboard',
})

const toast = useToast()
const router = useRouter()

const { mutate: createPost, isLoading } = useMutation({
  async mutation(values: z.infer<typeof postSchema>) {
    const res = await $fetch('/api/post', {
      method: 'POST',
      body: values,
    })
    return res
  },
  onSuccess({ title }) {
    toast.success({
      title: '成功',
      description: `文章${title}已创建`,
    })
    router.push(`/admin/posts`)
  },
  onError(error: any) {
    toast.error({
      title: '错误',
      description: error.message || '创建失败',
    })
  },
})
</script>

<template>
  <AdminPostForm
    :submitting="isLoading"
    @submit="createPost"
  />
</template>
