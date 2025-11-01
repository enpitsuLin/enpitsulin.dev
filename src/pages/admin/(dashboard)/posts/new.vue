<script setup lang="ts">
import type { PostFormData } from '~/schemas/post'
import { useMutation } from '@pinia/colada'
import { useForm } from '@tanstack/vue-form'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '~/components/ui/toast/use-toast'
import { useHC } from '~/composables/hc'
import { postSchema } from '~/schemas/post'

defineOptions({
  name: 'NewPostPage',
})

const $hc = useHC()
const router = useRouter()
const toast = useToast()

const tagsInput = ref('')

const { mutate, isLoading } = useMutation({
  async mutation(values: PostFormData & { tagsInput?: string }) {
    // Parse tags from comma-separated string
    const tags = values.tagsInput
      ? values.tagsInput.split(',').map(t => t.trim()).filter(t => t)
      : []

    const res = await $hc.api.post.$post({
      form: {
        title: values.title,
        slug: values.slug,
        content: values.content,
        status: values.status,
        tags,
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
    mutate({
      ...value,
      tagsInput: tagsInput.value,
      tags: [],
    })
  },
})
</script>

<template>
  <div style="padding: 20px; max-width: 800px;">
    <h1>新建文章</h1>

    <form
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

      <form.Field
        name="slug"
      >
        <template #default="{ field }">
          <UiFormField
            :field
            label="Slug"
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
        <UiButton
          type="submit"
          :disabled="isLoading"
        >
          {{ isLoading ? '提交中...' : '创建' }}
        </UiButton>
        <UiButton
          type="button"
          variant="outline"
          @click="router.push('/admin/posts')"
        >
          取消
        </UiButton>
      </div>
    </form>
  </div>
</template>
