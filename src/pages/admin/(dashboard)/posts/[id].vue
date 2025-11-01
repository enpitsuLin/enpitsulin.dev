<script setup lang="ts">
import type { PostFormData } from '~/schemas/post'
import { useMutation, useQuery } from '@pinia/colada'
import { useForm } from '@tanstack/vue-form'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '~/components/ui/toast/use-toast'
import { useHC } from '~/composables/hc'
import { postSchema } from '~/schemas/post'

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
  async mutation(values: PostFormData & { tagsInput?: string }) {
    // Parse tags from comma-separated string
    const tags = values.tagsInput
      ? values.tagsInput.split(',').map(t => t.trim()).filter(t => t)
      : []

    const res = await $hc.api.post[':id'].$patch({
      param: { id: postId },
      form: {
        title: values.title,
        content: values.content,
        status: values.status,
        tags,
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
  if (!post.value)
    return { title: '', slug: '', content: '', status: 'draft' as const }
  return {
    title: post.value.title,
    slug: post.value.slug,
    content: post.value.content,
    status: post.value.status,
  }
})

const form = useForm({
  defaultValues: {
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    tags: [],
  },
  validators: validatorsFromSchema(postSchema, 'submit'),
  onSubmit: async ({ value }) => {
    updatePost({
      ...value,
      tagsInput: tagsInput.value,
      tags: [],
    })
  },
})

// Watch for post data changes and update form
watch(initialValues, (newValues) => {
  form.setFieldValue('title', newValues.title)
  form.setFieldValue('slug', newValues.slug)
  form.setFieldValue('content', newValues.content)
  form.setFieldValue('status', newValues.status)
}, { immediate: true })
</script>

<template>
  <div style="padding: 20px; max-width: 800px;">
    <h1>编辑文章</h1>

    <div v-if="isLoadingPost">
      加载中...
    </div>
    <form
      v-else-if="post"
      flex="~ col gap-4"
      style="margin-top: 20px;"
      @submit="(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }"
    >
      <form.Field
        name="title"
      >
        <template #default="{ field }">
          <UiFormField
            :field
            label="标题"
          >
            <template #default="{ value, onInput, onBlur }">
              <input
                :value="value"
                type="text"
                w="full" p="x4 y2"
                border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
                bg="transparent"
                :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
                class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
                @input="onInput"
                @blur="onBlur"
              >
            </template>
          </UiFormField>
        </template>
      </form.Field>

      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px;">Slug (只读)</label>
        <input
          :value="post.slug"
          type="text"
          readonly
          w="full" p="x4 y2"
          border="~ border rounded-lg"
          bg="zinc-100 dark:zinc-800"
          class="text-xs text-zinc-900 dark:text-white"
        >
      </div>

      <form.Field
        name="content"
      >
        <template #default="{ field }">
          <UiFormField
            :field
            label="内容 (Markdown)"
          >
            <template #default="{ value, onInput, onBlur }">
              <textarea
                :value="value"
                rows="20"
                w="full" p="x4 y2"
                border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
                bg="transparent"
                :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
                class="text-xs text-zinc-900 font-mono outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
                @input="onInput"
                @blur="onBlur"
              />
            </template>
          </UiFormField>
        </template>
      </form.Field>

      <form.Field
        name="status"
      >
        <template #default="{ field }">
          <UiFormField
            :field
            label="状态"
          >
            <template #default="{ value, onInput, onBlur }">
              <select
                :value="value"
                w="full" p="x4 y2"
                border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
                bg="transparent"
                :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
                class="text-xs text-zinc-900 outline-none transition-all dark:text-white focus:ring-2 focus:ring-blue-500/20"
                @change="onInput"
                @blur="onBlur"
              >
                <option value="draft">
                  草稿
                </option>
                <option value="published">
                  已发布
                </option>
                <option value="archived">
                  已归档
                </option>
              </select>
            </template>
          </UiFormField>
        </template>
      </form.Field>

      <div>
        <label style="display: block; margin-bottom: 4px;" class="text-xs text-zinc-700 font-medium dark:text-zinc-300">标签 (逗号分隔)</label>
        <input
          v-model="tagsInput"
          type="text"
          placeholder="例如: 技术, Vue, JavaScript"
          w="full" p="x4 y2"
          border="~ border rounded-lg"
          bg="transparent"
          class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
        >
      </div>

      <div style="display: flex; gap: 8px;">
        <button
          type="submit"
          :disabled="isUpdating"
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          {{ isUpdating ? '更新中...' : '更新' }}
        </button>
        <button
          type="button"
          style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
          @click="router.push('/admin/posts')"
        >
          取消
        </button>
      </div>
    </form>
    <div v-else>
      文章不存在
    </div>
  </div>
</template>
