<script setup lang="ts">
import type z from 'zod'
import { useForm } from '@tanstack/vue-form'
import { postSchema } from '~~/shared/schema/post'

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
  publishedAt: undefined,
  createdAt: undefined,
  updatedAt: undefined,
}

const isEditing = !!defaultValues

const form = useForm({
  defaultValues: defaultValues ?? DEFAULT_VALUES,
  validators: validatorsFromSchema(postSchema, 'submit'),
  onSubmit: ({ value }) => {
    emit('submit', value)
  },
})

watch(() => defaultValues, (newValues) => {
  if (!newValues)
    return
  form.setFieldValue('title', newValues?.title ?? '')
  form.setFieldValue('content', newValues?.content ?? '')
  form.setFieldValue('slug', newValues?.slug ?? '')
  form.setFieldValue('status', newValues?.status ?? 'draft')
  form.setFieldValue('tags', newValues?.tags ?? [])
  form.setFieldValue('excerpt', newValues?.excerpt ?? '')
  form.setFieldValue('publishedAt', newValues?.publishedAt ?? undefined)
  form.setFieldValue('createdAt', newValues?.createdAt ?? undefined)
  form.setFieldValue('updatedAt', newValues?.updatedAt ?? undefined)
})
</script>

<template>
  <div flex="~ gap-4" px-4>
    <div flex-1>
      <span v-if="isEditing">
        编辑 「{{ form.state.values.title }}」
      </span>
      <span v-else>
        新建文章
      </span>
    </div>
    <UiButton :disabled="submitting" @click="() => form.handleSubmit()">
      {{ submitting ? '保存中...' : '保存' }}
    </UiButton>
  </div>
  <div
    role="form"
    grid="~ cols-12 gap-4"
    px-4
  >
    <div col-span="12 md:8" space-y-2>
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
        name="content"
      >
        <UiFormField
          v-slot="{ value, onInput, onBlur }"
          :field
          label="内容"
        >
          <textarea
            :value="value"
            rows="10"
            w="full" p="x4 y2"
            border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
            bg="transparent"
            :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
            class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
            @input="onInput"
            @blur="onBlur"
          />
        </UiFormField>
      </form.Field>
    </div>

    <aside col-span="12 md:4" space-y-2>
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

      <form.Field
        v-slot="{ field }"
        name="excerpt"
      >
        <UiFormField
          v-slot="{ value, onInput, onBlur }"
          :field
          label="摘记"
        >
          <textarea
            resize-none
            :value="value"
            w="full" p="x4 y2"
            border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
            bg="transparent"
            :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
            class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
            @input="onInput"
            @blur="onBlur"
          />
        </UiFormField>
      </form.Field>
      <form.Field
        v-slot="{ field }"
        name="publishedAt"
      >
        <UiFormField
          v-slot="{ value, handleChange }"
          :field
          label="发布时间"
        >
          <UiFormDatetimePicker
            :value="value"
            @update:value="handleChange"
          />
        </UiFormField>
      </form.Field>
    </aside>
  </div>
</template>
