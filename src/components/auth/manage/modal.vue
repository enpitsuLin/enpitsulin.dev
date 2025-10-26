<script setup lang="tsx">
import { Collapsible } from '@ark-ui/vue/collapsible'

import { Dialog } from '@ark-ui/vue/dialog'
import { useQuery } from '@pinia/colada'
import { useAuth } from '~/composables/auth'
import SessionInfo from './/session-info.vue'
import SessionSkeleton from './session-skeleton.vue'

const { client, loggedIn, session } = useAuth()

const isOpen = ref(false)

const { data: sessions, isLoading: isLoadingDevices } = useQuery({
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

const { data: accounts, isLoading: _isLoadingAccounts } = useQuery({
  key: () => ['accounts', loggedIn.value],
  query: async () => client
    .listAccounts({ fetchOptions: { throw: true } })
    .then(res => res.filter(account => account.providerId !== 'credential')),
  enabled: () => loggedIn.value,
})

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
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
        class="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      />
      <Dialog.Positioner>
        <Dialog.Content
          fixed h-2xl w-4xl
          border="~ zinc-200 dark:zinc-700 rounded-3xl"
          bg="white/50 dark:zinc-900/50"
          un-text="zinc-900 dark:white"
          class="left-1/2 top-1/2 z-100 origin-center backdrop-blur-xl -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <Dialog.CloseTrigger
            top="4"
            right="4"
            absolute rounded-lg p-2
            bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
            class="transition-colors"
          >
            <div class="i-mingcute:close-line size-4 text-zinc-500 dark:text-zinc-400" />
          </Dialog.CloseTrigger>

          <div flex="~" size-full py-2>
            <!-- 左侧导航 -->
            <div w="64" border-r="~ zinc-200 dark:zinc-700" flex="shrink-0">
              <nav p="4" space-y="2">
                <button
                  flex="inline items-center gap-3"
                  rounded-lg px-3 py-2.5
                  bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                  class="w-full rounded-lg text-left transition-all"
                >
                  <div class="i-mingcute:user-4-line size-5" />
                  <span text-sm font-medium>账户</span>
                </button>
                <button
                  flex="inline items-center gap-3"
                  rounded-lg px-3 py-2.5
                  bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                  class="w-full rounded-lg text-left transition-all"
                >
                  <div class="i-mingcute:shield-line size-5" />
                  <span text-sm font-medium>安全</span>
                </button>
              </nav>
            </div>

            <!-- 右侧内容区域 -->
            <div flex="1" p="y6 x8" h-full of-y-auto>
              <!-- 账户部分 -->
              <div pb-5 space-y-4>
                <div space-y-1>
                  <h3 text="3xl font-semibold">
                    账户
                  </h3>
                  <p text-sm op-70>
                    管理您的账户信息
                  </p>
                </div>
                <section space-y-4>
                  <h4 op-70>
                    已连接的账户
                  </h4>

                  <div flex="~ col items-center gap-1">
                    <Collapsible.Root
                      v-for="account in accounts"
                      :key="account.id"
                      w-full
                    >
                      <Collapsible.Trigger
                        bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                        flex="inline items-center justify-between gap-2"
                        p="x4 y3" w-full rounded-lg
                      >
                        <div class="i-mingcute:github-line size-4" />
                        <div flex-1 text-left text-xs>
                          <span capitalize> {{ account.providerId }}</span>
                        </div>
                        <Collapsible.Indicator
                          class="transition-transform duration-200 data-[state=open]:rotate-180"
                        >
                          <div class="i-mingcute:down-line size-4" />
                        </Collapsible.Indicator>
                      </Collapsible.Trigger>
                      <Collapsible.Content
                        of-hidden p-4 space-y-2
                        class="data-[state=closed]:animate-[accordion-up_200ms] data-[state=open]:animate-[accordion-down_250ms]"
                      >
                        <div flex="~ col items-start gap-1">
                          <div text-sm>
                            移除
                          </div>
                          <p text-xs op-70>
                            从您的账户中移除此已连接的账户
                          </p>
                        </div>
                        <button text-xs class="hover:underline">
                          移除
                        </button>
                      </Collapsible.Content>
                    </Collapsible.Root>
                  </div>
                </section>
              </div>

              <!-- 安全部分 -->
              <div pb-5 space-y-4>
                <div space-y-1>
                  <h3 text="3xl font-semibold">
                    安全
                  </h3>
                  <p text-sm op-70>
                    管理您的安全设置
                  </p>
                </div>
                <section space-y-4>
                  <h4 op-70>
                    活动设备
                  </h4>

                  <div flex="~ col items-center gap-1">
                    <!-- 加载状态时显示 skeleton -->
                    <template v-if="isLoadingDevices">
                      <SessionSkeleton
                        v-for="i in 1"
                        :key="`skeleton-${i}`"
                      />
                    </template>
                    <!-- 加载完成后显示实际数据 -->
                    <template v-else>
                      <SessionInfo
                        v-for="s in sessions"
                        :key="s.id"
                        :session="s"
                      />
                    </template>
                  </div>
                </section>
              </div>
            </div>
          </div>
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
</style>
