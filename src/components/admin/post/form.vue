<script setup lang="ts">
import type z from 'zod'
import { useForm } from '@tanstack/vue-form'
import { postSchema } from '~/schemas/post'

const {
  defaultValues,
  submitting = false,
} = defineProps<{
  defaultValues?: z.infer<typeof postSchema>
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [value: z.infer<typeof postSchema>]
}>()

const DEFAULT_VALUES: z.infer<typeof postSchema> = {
  title: '',
  excerpt: '',
  slug: '',
  content: '',
  status: 'draft',
  tags: [],
}

const form = useForm({
  defaultValues: defaultValues ?? DEFAULT_VALUES,
  validators: validatorsFromSchema(postSchema, 'submit'),
  onSubmit: async ({ value }) => {
    emit('submit', value)
  },
})
</script>

<template>
  <form
    flex="~ col gap-4"
    @submit="(e) => {
      e.preventDefault()
      e.stopPropagation()
      form.handleSubmit()
    }"
  >
    <form.Field
      v-slot="{ field }"
      name="title"
    >
      <UiFormField
        v-slot="{ value, onInput, onBlur }"
        :field
        label="标题"
      >
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
      </UiFormField>
    </form.Field>

    <form.Field
      v-slot="{ field }"
      name="slug"
    >
      <UiFormField
        v-slot="{ value, onInput, onBlur }"
        :field
        label="Slug"
      >
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
      </UiFormField>
    </form.Field>

    <form.Field
      v-slot="{ field }"
      name="content"
    >
      <UiFormField
        v-slot="{ value, handleChange, onBlur }"
        :field
        label="内容 (Markdown)"
      >
        <MarkdownEditor
          :value="value"
          @change="handleChange"
          @blur="onBlur"
        />
      </UiFormField>
    </form.Field>

    <form.Field
      v-slot="{ field }"
      name="status"
    >
      <UiFormField
        v-slot="{ value, onInput, onBlur }"
        :field
        label="状态"
      >
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
      </UiFormField>
    </form.Field>

    <form.Field
      v-slot="{ field }"
      name="tags"
    >
      <UiFormField
        v-slot="{ value, handleChange }"
        :field
        label="标签"
      >
        <UiFormTagInput
          :value="value"
          @change="handleChange"
        />
      </UiFormField>
    </form.Field>

    <UiButton type="submit" :disabled="submitting">
      {{ submitting ? '提交中...' : '提交' }}
    </UiButton>
  </form>
</template>
