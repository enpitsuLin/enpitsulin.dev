<script setup lang="ts">
import type z from 'zod'
import { useForm } from '@tanstack/vue-form'
import { thoughtSchema } from '~~/shared/schema/thought'
import { useToast } from '~/components/ui/toast/use-toast'

defineOptions({
  name: 'NewThoughtPage',
})

definePageMeta({
  breadcrumb: '新建',
  layout: 'dashboard',
  middleware: ['auth'],
})

const toast = useToast()
const router = useRouter()

const DEFAULT_VALUES: z.infer<typeof thoughtSchema> = {
  id: crypto.randomUUID(),
  content: '',
  mood: '',
  publishedAt: new Date(),
}

const form = useForm({
  defaultValues: DEFAULT_VALUES,
  validators: validatorsFromSchema(thoughtSchema, 'submit'),
  onSubmit: async ({ value }) => {
    try {
      await $fetch('/api/thought', {
        method: 'POST',
        body: value,
      })
      toast.success({
        title: '成功',
        description: '想法已创建',
      })
      router.push('/thoughts')
    }
    catch (error: any) {
      toast.error({
        title: '错误',
        description: error.message || '创建失败',
      })
    }
  },
})

const submitting = computed(() => form.state.isSubmitting)
</script>

<template>
  <div flex="~ col gap-4" px-4>
    <div flex="~ gap-4 items-center">
      <div flex-1>
        <span>新建想法</span>
      </div>
      <UiButton :disabled="submitting" @click="() => form.handleSubmit()">
        {{ submitting ? '保存中...' : '保存' }}
      </UiButton>
    </div>
    <div role="form" space-y-4 px-4>
      <form.Field
        v-slot="{ field }"
        name="mood"
      >
        <UiFormField
          v-slot="{ value, onInput, onBlur }"
          :field
          label="心情 (Emoji)"
        >
          <input
            :value="value"
            type="text"
            w="full" p="x4 y2"
            border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
            bg="transparent"
            :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
            class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
            placeholder="😊"
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
            rows="15"
            w="full" p="x4 y2"
            border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
            bg="transparent"
            :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
            class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
            placeholder="写下你的想法..."
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
    </div>
  </div>
</template>
