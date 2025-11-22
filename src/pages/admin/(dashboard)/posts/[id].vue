<script setup lang="ts">
import type { PostFormData } from '~/schemas/post'
import { useMutation, useQuery } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '~/components/ui/toast/use-toast'
import { useHC } from '~/composables/hc'

defineOptions({
  name: 'PostPage',
})

definePage({
  meta: {
    breadcrumb: '编辑文章',
  },
})

const route = useRoute('/admin/(dashboard)/posts/[id]')
const $hc = useHC()
const router = useRouter()
const toast = useToast()

const postId = route.params.id

// Fetch post data
const { data: post, isPending: isLoadingPost } = useQuery({
  key: ['post', postId],
  query: async () => {
    const res = await $hc.api.post[':id'].$get({
      param: { id: postId },
    })
    return res.json()
  },
})

const tagsInput = ref('')

// Update tagsInput when post loads
watch(post, (newPost) => {
  if (newPost?.tags) {
    tagsInput.value = newPost.tags.map(t => t.name).join(', ')
  }
}, { immediate: true })

const { mutate: updatePost, isLoading: isUpdating } = useMutation({
  async mutation(values: PostFormData) {
    const res = await $hc.api.post[':id'].$patch({
      param: { id: postId },
      form: {
        title: values.title,
        content: values.content,
        status: values.status,
        tags: values.tags,
      },
    })
    return await res.json()
  },
  onSuccess() {
    toast.success({
      title: '成功',
      description: '文章已更新',
    })
    router.push('/admin/posts')
  },
  onError(error: any) {
    toast.error({
      title: '错误',
      description: error.message || '更新失败',
    })
  },
})

// Initial values computed from post data
const initialValues = computed(() => {
  if (!post.value) {
    return {
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      tags: [],
    } satisfies PostFormData
  }
  return {
    title: post.value.title,
    slug: post.value.slug,
    excerpt: post.value.excerpt ?? undefined,
    content: post.value.content,
    status: post.value.status,
    tags: post.value.tags.map(t => t.name),
  } satisfies PostFormData
})
</script>

<template>
  <div style="padding: 20px; max-width: 800px;">
    <h1>编辑文章</h1>

    <div v-if="isLoadingPost">
      加载中...
    </div>

    <AdminPostForm
      v-else-if="post"
      :default-values="initialValues"
      :submitting="isUpdating"
      @submit="updatePost"
    />
    <div v-else>
      文章不存在
    </div>
  </div>
</template>
