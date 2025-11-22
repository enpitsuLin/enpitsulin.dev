<script setup lang="ts">
import type { PostFormData } from '~/schemas/post'
import { useMutation } from '@pinia/colada'
import { useRouter } from 'vue-router'
import { useToast } from '~/components/ui/toast/use-toast'
import { useHC } from '~/composables/hc'

defineOptions({
  name: 'NewPostPage',
})

definePage({
  meta: {
    breadcrumb: '新建文章',
  },
})

const $hc = useHC()
const router = useRouter()
const toast = useToast()

const { mutate, isLoading } = useMutation({
  async mutation(values: PostFormData) {
    const res = await $hc.api.post.$post({
      form: {
        title: values.title,
        slug: values.slug,
        content: values.content,
        status: values.status,
        tags: values.tags,
      },
    })
    return await res.json()
  },
  onSuccess(data) {
    toast.success({
      title: '成功',
      description: '文章已创建',
    })
    router.push(`/admin/posts/${data.id}`)
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
  <div style="padding: 20px; max-width: 800px;">
    <h1>新建文章</h1>

    <AdminPostForm :submitting="isLoading" @submit="mutate" />
  </div>
</template>
