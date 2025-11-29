<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog'
import { useMutation } from '@pinia/colada'
import SigninForm from '~/components/auth/signin-form.vue'
import SignupForm from '~/components/auth/signup-form.vue'
import { useToast } from '~/components/ui/toast/use-toast'
import { useAuthSession, useOauthPopup } from '~/composables/auth'

const { signIn, client } = useAuthSession()
const { openOauthPopup: openPopup } = useOauthPopup(500)

const isOpen = ref(false)
const isSignUp = ref(false)

function toggleMode() {
  isSignUp.value = !isSignUp.value
}

function handleSuccess() {
  isOpen.value = false
}

const toast = useToast()
function handleError(message: string) {
  toast.error({
    title: '操作失败',
    description: message,
  })
}

const { mutate: signInPasskey, isLoading: isLoadingSignInPasskey } = useMutation({
  async mutation() {
    return signIn.passkey({ }).then((res) => {
      if (res.error) {
        return Promise.reject(new Error(res.error.message))
      }
      return res.data
    })
  },
  onSuccess() {
    isOpen.value = false
  },
  onError(error) {
    handleError(error.message)
  },
})

const { mutate: signInSocial, isLoading: isLoadingSignInSocial } = useMutation({
  async mutation(provider: string) {
    const res = await signIn.social({
      provider,
      disableRedirect: true,
      fetchOptions: { throw: true },
    })
    if (!res.url) {
      return Promise.reject(new Error('Unexpected error'))
    }

    await openPopup(res.url)
    client.$store.notify('$sessionSignal')
  },
  onSuccess: async () => {
    isOpen.value = false
  },
  onError(error) {
    handleError(error.message)
  },
})
</script>

<template>
  <Dialog.Root v-model:open="isOpen">
    <Dialog.Trigger
      type="button"
      flex="~ items-center justify-center" of-hidden
      class="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
      title="登录"
    >
      <span class="sr-only">登录</span>
      <div class="i-mingcute:user-4-line size-4" />
    </Dialog.Trigger>
    <Teleport to="#teleports">
      <Dialog.Backdrop
        bg="zinc-800/40 dark:bg-black/40"
        class="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      />
      <Dialog.Positioner
        fixed
        class="left-1/2 top-4 z-$z-index sm:top-8 -translate-x-1/2"
      >
        <Dialog.Content
          p="6 sm:p-8" w="[calc(100vw-2rem)]"
          relative max-w-sm of-hidden
          border="~ border rounded-xl md:rounded-3xl"
          bg="white/95 dark:zinc-900/95"
          un-text="zinc-900 dark:white"
          class="z-100 origin-center backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
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
            <SigninForm
              v-if="!isSignUp"
              @success="handleSuccess"
              @error="handleError"
            />
            <SignupForm
              v-else
              @success="handleSuccess"
              @error="handleError"
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
