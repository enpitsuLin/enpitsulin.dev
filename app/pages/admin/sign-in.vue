<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import z from 'zod'
import { useToast } from '~/components/ui/toast/use-toast'
import { validatorsFromSchema } from '~/composables/form'

defineOptions({
  name: 'SignInPage',
})

definePageMeta({
  layout: false,
})

const router = useRouter()
const route = useRoute()
const toast = useToast()

const { loggedIn } = useUserSession()

if (loggedIn.value) {
  const redirect = (route.query.redirect as string) || '/admin'
  navigateTo(redirect, { replace: true })
}

// Form validation schema
const loginSchema = z.object({
  password: z.string().min(1, '请输入密码'),
})

// Login mutation
const { mutate: login, isLoading } = useMutation({
  mutation(values: { password: string }) {
    return $fetch('/api/login', {
      method: 'POST',
      body: values,
    })
  },
  onSuccess() {
    toast.success({
      title: '登录成功',
      description: '正在跳转到管理后台...',
    })
    // Redirect to the original page or admin dashboard
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  },
  onError(error: any) {
    toast.error({
      title: '登录失败',
      description: error.message || '密码错误，请重试',
    })
  },
})

// Form setup
const form = useForm({
  defaultValues: {
    password: '',
  } as z.infer<typeof loginSchema>,
  validators: {
    ...validatorsFromSchema(loginSchema, 'submit'),
  },
  onSubmit: ({ value }) => {
    login(value)
  },
})

// Handle Enter key press
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !isLoading.value) {
    form.handleSubmit()
  }
}
</script>

<template>
  <div min-h-screen flex="~ items-center justify-center">
    <div
      w="full" max-w-sm
      p="8 sm:p-12"
      relative of-hidden
      border="~ border rounded-xl md:rounded-3xl"
      bg="white/95 dark:zinc-900/95"
      un-text="zinc-900 dark:white"
    >
      <!-- Header -->
      <div flex="~ col items-center gap-2" text-center>
        <div
          flex="~ items-center justify-center"
          class="size-14 sm:size-16"
          un-text="zinc-900 dark:white"
        >
          <div class="i-mingcute:lock-line text-2xl sm:text-3xl text-zinc-600 dark:text-zinc-300" />
        </div>
        <div>
          <h1 text="xl sm:2xl font-semibold" class="text-zinc-900 dark:text-zinc-100">
            管理员登录
          </h1>
          <p text="xs sm:sm" class="text-zinc-500 dark:text-zinc-400 mt-1">
            请输入管理员密码以继续
          </p>
        </div>
      </div>

      <!-- Form -->
      <form
        space-y-4
        @submit.prevent="form.handleSubmit()"
        @keydown="handleKeydown"
      >
        <form.Field
          v-slot="{ field }"
          name="password"
        >
          <UiFormField
            v-slot="{ value, onInput, onBlur }"
            :field
            label="密码"
          >
            <div flex="~ items-center" relative>
              <input
                :value="value"
                type="password"
                autocomplete="current-password"
                w="full"
                p="x4 y3"
                border="~ border focus:blue-500 data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
                bg="transparent"
                :data-invalid="field.state.meta.errors.length > 0 ? '' : undefined"
                class="text-sm text-zinc-900 outline-none transition-all placeholder:text-sm dark:text-white focus:ring-2 focus:ring-blue-500/20 placeholder-zinc-500 dark:placeholder-zinc-400 pr-10"
                placeholder="请输入管理员密码"
                :disabled="isLoading"
                @input="onInput"
                @blur="onBlur"
              >
              <div
                absolute
                right-3
                top="1/2"
                flex="~ items-center justify-center"
                class="i-mingcute:eye-line text-zinc-400 dark:text-zinc-500 text-lg pointer-events-none -translate-y-1/2"
              />
            </div>
          </UiFormField>
        </form.Field>

        <!-- Submit Button -->
        <UiButton
          type="submit"
          w="full"
          size="large"
          :disabled="isLoading"
        >
          <template v-if="isLoading">
            <div class="loading-spinner" />
            <span>登录中...</span>
          </template>
          <template v-else>
            <span>登录</span>
          </template>
        </UiButton>
      </form>

      <!-- Footer -->
      <div text-center pt-2>
        <UiButton
          variant="ghost"
          w="full"
          size="large" as-child
        >
          <NuxtLink to="/">
            <div class="i-mingcute:arrow-left-line" />
            <span>返回首页</span>
          </NuxtLink>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
