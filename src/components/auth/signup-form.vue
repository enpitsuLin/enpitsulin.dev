<script setup lang="ts">
import type { SignupFormData } from '~/schemas/auth'
import { useMutation } from '@pinia/colada'
import { useForm } from '@tanstack/vue-form'
import { useAuth } from '~/composables/auth'
import { signupSchema } from '~/schemas/auth'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const { signUp } = useAuth()

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

const form = useForm({
  defaultValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  validators: validatorsFromSchema(signupSchema, 'submit'),
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
    <!-- Name field -->
    <form.Field
      name="name"
    >
      <template #default="{ field }">
        <UiFormField
          :field
          label="用户名"
        >
          <template #default="{ value, onInput, onBlur }">
            <input
              :value="value"
              type="text"
              placeholder="请输入用户名"
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

    <!-- Email field -->
    <form.Field
      name="email"
    >
      <template #default="{ field }">
        <UiFormField
          :field
          label="邮箱地址"
        >
          <template #default="{ value, onInput, onBlur }">
            <input
              :value="value"
              type="email"
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

    <!-- Password field -->
    <form.Field
      name="password"
    >
      <template #default="{ field }">
        <UiFormField
          :field
          label="密码"
        >
          <template #default="{ value, onInput, onBlur }">
            <input
              :value="value"
              type="password"
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

    <!-- Confirm Password field -->
    <form.Field
      name="confirmPassword"
    >
      <template #default="{ field }">
        <UiFormField
          :field
          label="确认密码"
        >
          <template #default="{ value, onInput, onBlur }">
            <input
              :value="value"
              type="password"
              placeholder="请再次输入密码"
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
  </form>
</template>
