<script setup lang="ts">
import type { LoginFormData } from '~/schemas/auth'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useAuth } from '~/composables/auth'
import { loginSchema } from '~/schemas/auth'

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const { signIn } = useAuth()

const isLoading = ref(false)

// 使用 vee-validate 和 zod 进行表单验证
const { handleSubmit, defineField, errors } = useForm<LoginFormData>({
  validationSchema: toTypedSchema(loginSchema),
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

// 处理表单提交
const onSubmit = handleSubmit(async (values) => {
  if (isLoading.value)
    return

  isLoading.value = true

  try {
    const result = await signIn.email({
      email: values.email,
      password: values.password,
    })

    if (result.data) {
      emit('success')
    }
    else {
      emit('error', '登录失败，请检查邮箱和密码')
    }
  }
  catch (error) {
    console.error('Login error:', error)
    emit('error', '登录失败，请重试')
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <form flex="~ col gap-4" @submit="onSubmit">
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
        {{ isLoading ? '登录中...' : '登录' }}
      </span>
    </button>
  </form>
</template>
