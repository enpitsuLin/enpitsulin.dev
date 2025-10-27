<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog'
import { useMutation } from '@pinia/colada'
import LoginForm from '~/components/auth/login-form.vue'
import SignupForm from '~/components/auth/signup-form.vue'
import { useAuth } from '~/composables/auth'

const { signIn } = useAuth()

const isOpen = ref(false)
const isSignUp = ref(false)
const errorMessage = ref('')

function toggleMode() {
  isSignUp.value = !isSignUp.value
}

function handleSuccess() {
  isOpen.value = false
}

const { mutate: signInPasskey, isLoading: isLoadingSignInPasskey } = useMutation({
  mutation() {
    return signIn.passkey({ })
  },
  onSuccess() {
    isOpen.value = false
  },
})

const { mutate: signInSocial, isLoading: isLoadingSignInSocial } = useMutation({
  mutation(provider: string) {
    return signIn.social({
      provider,
    })
  },
  onSuccess() {
    isOpen.value = false
  },
})

// Expose methods for parent component
defineExpose({
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false },
})
</script>

<template>
  <Dialog.Root v-model:open="isOpen">
    <Teleport to="body">
      <Dialog.Backdrop
        bg="zinc-800/40 dark:bg-black/40"
        class="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      />
      <Dialog.Positioner>
        <Dialog.Content
          fixed
          p="6 sm:p-8"
          border="~ border rounded-3xl"
          bg="white/95 dark:zinc-900/95"
          class="left-1/2 top-4 z-100 max-w-sm w-[calc(100vw-2rem)] origin-top backdrop-blur-xl sm:top-8 sm:max-w-sm sm:w-full -translate-x-1/2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <!-- Header with Avatar and Title -->
          <div mb="8" space-y-2>
            <!-- Title -->
            <h2 un-text="2xl font-bold zinc-900 dark:white mb-2">
              {{ isSignUp ? '注册' : '登录' }}
            </h2>

            <!-- Subtitle -->
            <p un-text="xs zinc-500 dark:text-zinc-400">
              {{ isSignUp ? '创建新账户开始使用' : '继续使用 enpitsulin.dev' }}
            </p>
          </div>

          <!-- Close Button -->
          <Dialog.CloseTrigger
            top="4"
            right="4"
            absolute rounded-lg p-2
            bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
            class="transition-colors"
          >
            <div class="i-mingcute:close-line size-4 text-zinc-500 dark:text-zinc-400" />
          </Dialog.CloseTrigger>

          <div mt-6>
            <!-- Error Message -->
            <div
              v-if="errorMessage"
              un-text="xs text-red-600 dark:text-red-400"
              class="mb-4 border border-red-200 rounded-lg bg-red-50 p-3 dark:border-red-800/50 dark:bg-red-900/20"
            >
              <div flex="~ items-center gap-2">
                <div class="i-mingcute:warning-line size-4" />
                {{ errorMessage }}
              </div>
            </div>

            <div space-y-2>
              <button
                :disabled="isLoadingSignInSocial"
                w="full"
                p="x5 y2.5"
                flex="~ items-center gap-2"
                border="~ border rounded-lg"
                bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                class="group transition-all duration-200"
                @click="signInSocial('github')"
              >
                <div class="i-mingcute:github-line size-5 text-zinc-700 transition-colors dark:text-white" />
                <div
                  flex-1 text-left
                  un-text="xs font-medium text-zinc-700 dark:text-white transition-colors"
                >
                  {{ isLoadingSignInSocial ? '处理中...' : '使用 GitHub 登录' }}
                </div>
                <div class="i-mingcute:arrow-right-line invisible size-4 text-zinc-500 transition-all group-hover:visible group-hover:translate-x-1" />
              </button>

              <button
                :disabled="isLoadingSignInPasskey"
                w="full"
                p="x5 y2.5"
                flex="~ items-center gap-2"
                border="~ border rounded-lg"
                bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                class="group transition-all duration-200"
                @click="signInPasskey()"
              >
                <div class="i-mingcute:key-2-line size-5 text-zinc-700 transition-colors dark:text-white" />
                <div
                  flex-1 text-left
                  un-text="xs font-medium text-zinc-700 dark:text-white transition-colors"
                >
                  {{ isLoadingSignInPasskey ? '处理中...' : '使用 Passkey 登录' }}
                </div>
                <div class="i-mingcute:arrow-right-line invisible size-4 text-zinc-500 transition-all group-hover:visible group-hover:translate-x-1" />
              </button>
            </div>

            <!-- Divider -->
            <div flex="~ items-center gap-3" py="4">
              <div flex="1" h="1px" bg="border" />
              <span un-text="xs text-zinc-500 dark:text-zinc-400">或者</span>
              <div flex="1" h="1px" bg="border" />
            </div>

            <!-- Form Components -->
            <LoginForm
              v-if="!isSignUp"
              @success="handleSuccess"
              @error="console.error($event)"
            />
            <SignupForm
              v-else
              @success="handleSuccess"
              @error="console.error($event)"
            />

            <!-- Toggle mode -->
            <div mt-3 text="center">
              <span un-text="xs text-zinc-500 dark:text-zinc-400">
                {{ isSignUp ? '已有账户？' : '还没有账户？' }}
              </span>
              <button
                un-text="xs text-zinc-700 dark:text-white underline hover:text-blue-600 dark:hover:text-blue-400"
                class="ml-1 underline transition-colors"
                @click="toggleMode"
              >
                {{ isSignUp ? '登录' : '注册' }}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Teleport>
  </Dialog.Root>
</template>
