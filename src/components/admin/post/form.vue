<script setup lang="ts">
import type z from 'zod'
import { ClientOnly } from '@ark-ui/vue'
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

const isEditing = !!defaultValues

const form = useForm({
  defaultValues: defaultValues ?? DEFAULT_VALUES,
  validators: validatorsFromSchema(postSchema, 'submit'),
  onSubmit: ({ value }) => {
    emit('submit', value)
  },
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
        <ClientOnly>
          <MarkdownEditor
            h-80svh flex-1 of-auto
            border="~ border rounded-lg"
            :value="field.state.value"
            @change="field.handleChange($event)"
            @blur="field.handleBlur"
          />
        </ClientOnly>
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
      <div flex="~ gap-2">
        <UiFormDatetimePicker />
      </div>
    </aside>
  </div>
</template>
