<script setup lang="ts">
import type { SignupFormData } from '~/schemas/auth'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useAuth } from '~/composables/auth'
import { signupSchema } from '~/schemas/auth'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const { signUp } = useAuth()

const isLoading = ref(false)

// 使用 vee-validate 和 zod 进行表单验证
const { handleSubmit, defineField, errors } = useForm<SignupFormData>({
  validationSchema: toTypedSchema(signupSchema),
})

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

// 处理表单提交
const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value)
    return

  isLoading.value = true

  try {
    const result = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    })

    if (result.data) {
      emit('success')
    }
    else {
      emit('error', '注册失败，请检查邮箱是否已被使用')
    }
  }
  catch (error) {
    console.error('Signup error:', error)
    emit('error', '注册失败，请重试')
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <form flex="~ col gap-4" @submit="onSubmit">
    <!-- Name field -->
    <div>
      <label un-text="xs font-medium text-zinc-700 dark:text-zinc-300" block mb="2">
        用户名
      </label>
      <input
        v-model="name"
        v-bind="nameAttrs"
        type="text"
        placeholder="请输入用户名"
        w="full"
        px="4"
        py="2"
        border="~ zinc-200 dark:zinc-700 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400" :class="[
          errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500',
        ]"
      >
      <div v-if="errors.name" un-text="xs text-red-500 mt-1">
        {{ errors.name }}
      </div>
    </div>

    <!-- Email field -->
    <div>
      <label un-text="xs font-medium text-zinc-700 dark:text-zinc-300" block mb="2">
        邮箱地址
      </label>
      <input
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        placeholder="请输入邮箱地址"
        w="full"
        px="4"
        py="2"
        border="~ zinc-200 dark:zinc-700 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400" :class="[
          errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500',
        ]"
      >
      <div v-if="errors.email" un-text="xs text-red-500 mt-1">
        {{ errors.email }}
      </div>
    </div>

    <!-- Password field -->
    <div>
      <label un-text="xs font-medium text-zinc-700 dark:text-zinc-300" block mb="2">
        密码
      </label>
      <input
        v-model="password"
        v-bind="passwordAttrs"
        type="password"
        placeholder="请输入密码"
        w="full"
        px="4"
        py="2"
        border="~ zinc-200 dark:zinc-700 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400" :class="[
          errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500',
        ]"
      >
      <div v-if="errors.password" un-text="xs text-red-500 mt-1">
        {{ errors.password }}
      </div>
    </div>

    <!-- Confirm Password field -->
    <div>
      <label un-text="xs font-medium text-zinc-700 dark:text-zinc-300" block mb="2">
        确认密码
      </label>
      <input
        v-model="confirmPassword"
        v-bind="confirmPasswordAttrs"
        type="password"
        placeholder="请再次输入密码"
        w-full
        p="x4 y2"
        border="~ zinc-200 dark:zinc-700 rounded-lg"
        bg="transparent"
        class="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400" :class="[
          errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500',
        ]"
      >
      <div v-if="errors.confirmPassword" un-text="xs text-red-500 mt-1">
        {{ errors.confirmPassword }}
      </div>
    </div>

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
