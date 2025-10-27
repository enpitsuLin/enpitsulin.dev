<script setup lang="ts">
import type { SignupFormData } from '~/schemas/auth'
import { useMutation } from '@pinia/colada'
import { toTypedSchema } from '@vee-validate/zod'
import { Form } from 'vee-validate'
import { useAuth } from '~/composables/auth'
import { signupSchema } from '~/schemas/auth'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const { signUp } = useAuth()

const schema = toTypedSchema(signupSchema)

const { mutate, isLoading } = useMutation({
  mutation(values: SignupFormData) {
    return signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
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
</script>

<template>
  <Form
    :validation-schema="schema"
    :initial-values="{ name: '', email: '', password: '', confirmPassword: '' }"
    flex="~ col gap-4"
    @submit="(data) => mutate(data as SignupFormData)"
  >
    <!-- Name field -->
    <UiFormField
      v-slot="{ props }"
      label="用户名" name="name"
    >
      <input
        v-bind="props"
        type="text"
        placeholder="请输入用户名"
        w="full" p="x4 y2"
        border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
    </UiFormField>

    <!-- Email field -->
    <UiFormField
      v-slot="{ props }"
      label="邮箱地址" name="email"
    >
      <input
        v-bind="props"
        type="email"
        placeholder="请输入邮箱地址"
        w="full" p="x4 y2"
        border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
    </UiFormField>

    <!-- Password field -->
    <UiFormField
      v-slot="{ props }"
      label="密码" name="password"
    >
      <input
        v-bind="props"
        type="password"
        placeholder="请输入密码"
        w="full" p="x4 y2"
        border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
    </UiFormField>

    <!-- Confirm Password field -->
    <UiFormField
      v-slot="{ props }"
      label="确认密码" name="confirmPassword"
    >
      <input
        v-bind="props"
        type="password"
        placeholder="请再次输入密码"
        w="full" p="x4 y2"
        border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400"
      >
    </UiFormField>

    <!-- Submit button -->
    <button
      type="submit"
      :disabled="isLoading"
      w-full
      p="x3 y2"
      bg="zinc-800 hover:zinc-700 dark:zinc-50 dark:hover:zinc-100"
      un-text="zinc-50 xs dark:zinc-900 font-medium"
      rounded="lg"
      class="group transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span flex="~ items-center justify-center gap-2">
        {{ isLoading ? '注册中...' : '注册' }}
      </span>
    </button>
  </Form>
</template>
