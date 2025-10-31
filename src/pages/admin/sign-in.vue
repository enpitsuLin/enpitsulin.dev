<script setup lang="ts">
import { useMutation } from '@pinia/colada'
import { logger } from '~~/lib/logger'
import SigninForm from '~/components/auth/signin-form.vue'
import { useToast } from '~/components/ui/toast/use-toast'
import { useAuth } from '~/composables/auth'

const { signIn, client, user } = useAuth()

const route = useRoute('/admin/sign-in')
const router = useRouter()

if (user.value && user.value.role === 'admin') {
  logger.info('redirect to', user.value, route.query.redirect)
  if (route.query.redirect) {
    await router.push(decodeURIComponent(route.query.redirect as string))
  }
  else {
    await router.push('/dashboard')
  }
}

const toast = useToast()
function handleError(message: string) {
  toast.error({
    title: '操作失败',
    description: message,
  })
}

const { openOauthPopup: openPopup } = useOauthPopup(500)

const { mutate: signInPasskey, isLoading: isLoadingSignInPasskey } = useMutation({
  async mutation() {
    return signIn.passkey({}).then((res) => {
      if (res.error) {
        return Promise.reject(new Error(res.error.message))
      }
      return res.data
    })
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
  onError(error) {
    handleError(error.message)
  },
})
</script>

<template>
  <div flex="~ col items-center justify-center gap-6" min-h-svh p="6 md:10">
    <div max-w-sm w-full flex="~ col gap-6">
      <a href="#" class="flex items-center self-center gap-2 font-medium">
        <div class="bg-primary text-primary-foreground size-6 flex items-center justify-center rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="size-4"
          >
            <path d="M7 2h10" />
            <path d="M5 6h14" />
            <rect width="18" height="12" x="3" y="10" rx="2" />
          </svg>
        </div>
        <span>enpitsulin.dev</span>
      </a>
      <div border="~ border rounded-lg" p="4" flex="~ col gap-2">
        <div
          grid="~ auto-rows-min rows-[auto_auto] items-start gap-2 "
          class="@container/card-header [.border-b]:pb-6 px-6 text-center has-data-[slot=card-action]:grid-cols-[1fr_auto]"
        >
          <h2 un-text="2xl font-bold zinc-900 dark:white">
            欢迎回来
          </h2>
          <div un-text="xs zinc-500 dark:text-zinc-400">
            使用 GitHub 账户或 Passkey 登录管理员账户
          </div>
        </div>

        <div mt-6>
          <div space-y-2>
            <button
              :disabled="isLoadingSignInSocial" w="full" p="x5 y2.5" flex="~ items-center gap-2"
              border="~ border rounded-lg" bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              class="group transition-all duration-200" @click="signInSocial('github')"
            >
              <div class="i-mingcute:github-line size-5 text-zinc-700 transition-colors dark:text-white" />
              <div flex-1 text-left un-text="xs font-medium text-zinc-700 dark:text-white transition-colors">
                {{ isLoadingSignInSocial ? '处理中...' : '使用 GitHub 登录' }}
              </div>
              <div
                class="i-mingcute:arrow-right-line invisible size-4 text-zinc-500 transition-all group-hover:visible group-hover:translate-x-1"
              />
            </button>

            <button
              :disabled="isLoadingSignInPasskey" w="full" p="x5 y2.5" flex="~ items-center gap-2"
              border="~ border rounded-lg" bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              class="group transition-all duration-200" @click="signInPasskey()"
            >
              <div class="i-mingcute:key-2-line size-5 text-zinc-700 transition-colors dark:text-white" />
              <div flex-1 text-left un-text="xs font-medium text-zinc-700 dark:text-white transition-colors">
                {{ isLoadingSignInPasskey ? '处理中...' : '使用 Passkey 登录' }}
              </div>
              <div
                class="i-mingcute:arrow-right-line invisible size-4 text-zinc-500 transition-all group-hover:visible group-hover:translate-x-1"
              />
            </button>
          </div>

          <!-- Divider -->
          <div flex="~ items-center gap-3" py="4">
            <div flex="1" h="1px" bg="border" />
            <span un-text="xs text-zinc-500 dark:text-zinc-400">或者</span>
            <div flex="1" h="1px" bg="border" />
          </div>

          <SigninForm @error="handleError" />
        </div>
      </div>
    </div>
  </div>
</template>
