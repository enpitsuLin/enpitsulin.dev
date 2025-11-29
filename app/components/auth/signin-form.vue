<script setup lang="ts">
import { useMutation } from '@pinia/colada'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { useAuthSession } from '~/composables/auth'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const loginSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少需要6个字符'),
})

const { signIn } = useAuthSession()

const { mutate, isLoading } = useMutation({
  mutation(values: z.infer<typeof loginSchema>) {
    return signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      { throw: true },
    )
  },
  onSuccess() {
    emit('success')
  },
  onError(error) {
    emit('error', error.message)
  },
})

const form = useForm({
  defaultValues: {
    email: '',
    password: '',
  },
  validators: validatorsFromSchema(loginSchema, 'submit'),
  onSubmit: async ({ value }) => {
    mutate(value)
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
    <form.Field name="email">
      <template #default="{ field }">
        <UiFormField
          :field
          label="邮箱地址"
        >
          <template #default="{ value, onInput, onBlur }">
            <input
              :value="value"
              type="email"
              autocomplete="email"
              placeholder="请输入邮箱地址"
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

    <form.Field name="password">
      <template #default="{ field }">
        <UiFormField
          :field
          label="密码"
        >
          <template #default="{ value, onInput, onBlur }">
            <input
              :value="value"
              type="password"
              autocomplete="current-password"
              placeholder="请输入密码"
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

    <UiButton
      type="submit"
      :disabled="isLoading"
    >
      {{ isLoading ? '登录中...' : '登录' }}
    </UiButton>
  </form>
</template>
