<script setup lang="tsx">
import { Avatar } from '@ark-ui/vue'
import { Dialog } from '@ark-ui/vue/dialog'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { motion, useInView } from 'motion-v'
import { useAuth } from '~/composables/auth'
import AccountInfo from './account-info.vue'
import AccountSkeleton from './account-skeleton.vue'
import EmailInfo from './email-info.vue'
import PasskeyInfo from './passkey-info.vue'
import PasskeySkeleton from './passkey-skeleton.vue'
import Section from './section.vue'
import SessionInfo from './session-info.vue'
import SessionSkeleton from './session-skeleton.vue'

const { client, loggedIn, session, user } = useAuth()

const isOpen = ref(false)
const isSidebarOpen = ref(false)
const isMobile = useMediaQuery('(max-width: 768px)')

// 监听屏幕尺寸变化，桌面端自动展开侧边栏
watch(isMobile, (mobile) => {
  if (!mobile) {
    isSidebarOpen.value = false
  }
})

const scrollContainer = useTemplateRef('scrollContainer')
const accountSectionTitle = useTemplateRef('accountSectionTitle')
const securitySectionTitle = useTemplateRef('securitySectionTitle')

const { y: scrollY } = useScroll(scrollContainer)
const isAccountSectionInView = useInView(accountSectionTitle)
const isSecuritySectionInView = useInView(securitySectionTitle)

const queryCache = useQueryCache()

const { data: sessions, isPending: isDevicesPending } = useQuery({
  key: () => ['sessions', loggedIn.value],
  query: async () => client.listSessions({ fetchOptions: { throw: true } })
    .then(res => res.sort((a, b) => {
      if (a.id === session.value.data?.session.id)
        return -1
      if (b.id === session.value.data?.session.id)
        return 1
      return 0
    })),
  enabled: () => loggedIn.value,
})

const { data: accounts, isPending: isAccountsPending } = useQuery({
  key: () => ['accounts', loggedIn.value],
  query: async () => client
    .listAccounts({ fetchOptions: { throw: true } })
    .then(res => res.filter(account => account.providerId !== 'credential')),
  enabled: () => loggedIn.value,
})

const { mutate: linkSocial, isLoading: isLoadingLinkSocial } = useMutation({
  mutation(provider: string) {
    return client.linkSocial({ provider })
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['accounts'] })
  },
})

const { data: passkeys, isPending: isPasskeysPending } = useQuery({
  key: () => ['passkeys', loggedIn.value],
  query: async () => client.passkey.listUserPasskeys({
    fetchOptions: { throw: true },
  }),
  enabled: () => loggedIn.value,
})

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function scrollToSection(sectionId: string) {
  const targetRef = sectionId === 'account' ? accountSectionTitle : securitySectionTitle

  if (targetRef.value) {
    targetRef.value.scrollIntoView({
      behavior: 'smooth',
    })
  }

  // 移动端点击后关闭侧边栏
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  open: openModal,
  close: closeModal,
})
</script>

<template>
  <Dialog.Root v-model:open="isOpen">
    <Teleport to="body">
      <Dialog.Backdrop
        bg="zinc-800/40 dark:bg-black/40"
        class="fixed inset-0 z-$z-index backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      />
      <Dialog.Positioner
        fixed
        class="left-1/2 top-1/2 z-$z-index -translate-x-1/2 -translate-y-1/2"
      >
        <Dialog.Content
          relative of-hidden
          h="xl md:2xl" w="90vw md:4xl"
          border="~ border rounded-xl md:rounded-3xl"
          bg="white/50 dark:zinc-900/50"
          un-text="zinc-900 dark:white"
          class="z-100 origin-center backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <div flex="~" size-full of-hidden>
            <!-- 移动端遮罩层 -->
            <Transition name="fade">
              <div
                v-if="isMobile && isSidebarOpen"
                class="absolute inset-0 z-10 bg-black/20"
                @click="isSidebarOpen = false"
              />
            </Transition>

            <!-- 左侧导航 -->
            <Transition name="sidebar">
              <div
                v-show="!isMobile || isSidebarOpen"
                border="r border"
                class="w-64 flex-shrink-0"
                :class="isMobile && 'absolute inset-y-0 left-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl'"
              >
                <nav p="4" space-y="2">
                  <button
                    flex="inline items-center gap-3"
                    rounded-lg px-3 py-2.5
                    :data-active="isAccountSectionInView"
                    bg="data-[active=true]:zinc-200/50 data-[active=true]:dark:zinc-700/50 transparent'"
                    hover:bg="zinc-200/50 dark:hover:zinc-700/50"
                    class="w-full rounded-lg text-left transition-all"
                    @click="scrollToSection('account')"
                  >
                    <div class="i-mingcute:user-4-line size-5" />
                    <span text-sm font-medium>账户</span>
                  </button>
                  <button
                    flex="inline items-center gap-3"
                    rounded-lg px-3 py-2.5
                    :data-active="!isAccountSectionInView && isSecuritySectionInView"
                    bg="data-[active=true]:zinc-200/50 data-[active=true]:dark:zinc-700/50 transparent'"
                    hover:bg="zinc-200/50 dark:hover:zinc-700/50"
                    class="w-full rounded-lg text-left transition-all"
                    @click="scrollToSection('security')"
                  >
                    <div class="i-mingcute:shield-line size-5" />
                    <span text-sm font-medium>安全</span>
                  </button>
                </nav>
              </div>
            </Transition>

            <!-- 右侧内容区域 -->
            <div ref="scrollContainer" flex="1" h-full of-y-auto>
              <!-- 汉堡菜单按钮（仅移动端显示） -->
              <motion.div
                flex="~ items-center"
                class="[&>*]:pointer-events-auto md:hidden"
                pointer-events-none sticky top-0 w-full p="2 md:4" backdrop-blur
                :style="{
                  backdropFilter: `blur(${scrollY > 100 ? '10px' : '0px'})`,
                }"
              >
                <button
                  v-if="isMobile"
                  z-10 rounded-lg p-2
                  bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                  class="transition-colors md:hidden"
                  @click="isSidebarOpen = !isSidebarOpen"
                >
                  <div class="i-mingcute:menu-line size-4 text-zinc-500 dark:text-zinc-400" />
                </button>
              </motion.div>
              <div p="y6 x4 md:x8">
                <!-- 账户部分 -->
                <div role="group" pb-5 space-y-4>
                  <div ref="accountSectionTitle" space-y-1>
                    <h3 text="3xl font-semibold">
                      账户
                    </h3>
                    <p text-sm op-70>
                      管理您的账户信息
                    </p>
                  </div>
                  <Section title="个人资料">
                    <button
                      type="button"
                      class="group"
                      bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                      flex="inline items-center justify-between gap-2"
                      p="x4 y3" w-full rounded-lg
                    >
                      <Avatar.Root size-15 of-hidden rounded-full>
                        <Avatar.Fallback
                          size-full border="~ rounded-full" text-3xl
                          flex="data-[state=visible]:inline items-center justify-center"
                        >
                          {{ user?.name?.charAt(0).toUpperCase() ?? 'U' }}
                        </Avatar.Fallback>
                        <Avatar.Image :src="user?.image ?? ''" alt="avatar" />
                      </Avatar.Root>
                      <div flex-1 text-left>
                        {{ user?.name }}
                      </div>
                      <div
                        i-mingcute:arrow-right-line
                        invisible size-4 transition-transform
                        duration-200 group-hover:visible
                        translate-x="-1"
                        group-hover:translate-x-0
                      />
                    </button>
                  </Section>
                  <Section title="电子邮件地址">
                    <template v-if="user?.email">
                      <EmailInfo :user />
                    </template>
                  </Section>
                  <Section title="已连接的账户">
                    <template v-if="isAccountsPending">
                      <AccountSkeleton
                        v-for="i in 1"
                        :key="`skeleton-${i}`"
                      />
                    </template>
                    <template v-else>
                      <AccountInfo
                        v-for="account in accounts"
                        :key="account.accountId"
                        :account="account"
                      />
                    </template>
                    <button
                      type="button"
                      class="group"
                      bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                      flex="inline items-center justify-between gap-2"
                      p="x3 y2" w-full rounded-lg
                      :disabled="isLoadingLinkSocial"
                      @click="linkSocial('github')"
                    >
                      <div class="i-mingcute:add-line size-4" />
                      <div flex-1 text-left text-xs font-medium op-70>
                        连接账户
                      </div>
                      <div
                        i-mingcute:arrow-right-line
                        invisible size-4 transition-transform
                        duration-200 group-hover:visible
                        translate-x="-1"
                        group-hover:translate-x-0
                      />
                    </button>
                  </Section>
                </div>

                <!-- 安全部分 -->
                <div role="group" pb-5 space-y-4>
                  <div ref="securitySectionTitle" space-y-1>
                    <h3 text="3xl font-semibold">
                      安全
                    </h3>
                    <p text-sm op-70>
                      管理您的安全设置
                    </p>
                  </div>
                  <Section title="密码">
                    TODO
                  </Section>
                  <Section title="通行密钥">
                    <template v-if="isPasskeysPending">
                      <PasskeySkeleton
                        v-for="i in 1"
                        :key="`skeleton-${i}`"
                      />
                    </template>
                    <template v-else>
                      <PasskeyInfo
                        v-for="passkey in passkeys"
                        :key="passkey.id"
                        :passkey="passkey"
                      />
                    </template>
                    <AuthManageAddPasskey />
                  </Section>
                  <Section title="活动设备">
                    <template v-if="isDevicesPending">
                      <SessionSkeleton
                        v-for="i in 1"
                        :key="`skeleton-${i}`"
                      />
                    </template>
                    <template v-else>
                      <SessionInfo
                        v-for="s in sessions"
                        :key="s.id"
                        :session="s"
                      />
                    </template>
                  </Section>
                </div>
              </div>
            </div>
          </div>

          <Dialog.CloseTrigger
            absolute right="2 md:4" top="2 md:4" rounded-lg p-2
            bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
            class="transition-colors"
          >
            <div class="i-mingcute:close-line size-4 text-zinc-500 dark:text-zinc-400" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Teleport>
  </Dialog.Root>
</template>

<style>
@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--height);
  }
  to {
    height: 0;
  }
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
