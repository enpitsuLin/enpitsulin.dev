<script setup lang="ts">
import { HoverCard } from '@ark-ui/vue/hover-card'

const { visitors, pageVisitors, status } = useVisitors()
const connectionStatus = computed(() => ({
  OPEN: '在线',
  CONNECTING: '连接中',
  CLOSED: '离线',
})[status.value])
</script>

<template>
  <HoverCard.Root :positioning="{ placement: 'top-end', gutter: 12 }" :open-delay="200" lazy-mount unmount-on-exit>
    <HoverCard.Trigger
      flex="~ gap-2 items-center" rounded-md px-2 py-1
      class="text-xs text-zinc-600 transition hover:bg-zinc-200/50 focus-visible:ring-2 focus-visible:ring-accent dark:text-zinc-300 dark:hover:bg-zinc-800/50"
    >
      <span relative flex size-2 aria-hidden="true">
        <span v-if="status === 'OPEN'" animate-ping absolute inline-flex size-full rounded-full bg-green-400 opacity-75 />
        <span
          relative inline-flex rounded-full size-2
          :class="status === 'OPEN' ? 'bg-green-500' : status === 'CONNECTING' ? 'bg-amber-500' : 'bg-zinc-400'"
        />
      </span>
      <span>{{ status === 'OPEN' ? visitors ?? '—' : '—' }}个小伙伴在一起看</span>
    </HoverCard.Trigger>
    <Teleport to="#teleports">
      <HoverCard.Positioner z-100>
        <HoverCard.Content
          w-72 max-w="[calc(100vw-2rem)]" overflow-hidden rounded-xl bg="white dark:zinc-900"
          ring="1 black/5 dark:white/10" shadow="lg black/5 dark:black/20"
          class="text-zinc-800 dark:text-zinc-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div p-4>
            <div flex="~ items-center justify-between gap-3">
              <h2 text-sm font-medium leading-tight>
                在线伙伴
              </h2>
              <span flex="~ items-center gap-1.5" un-text="xs zinc-500 dark:zinc-400" whitespace-nowrap role="status">
                <span sr-only>连接状态：</span>
                <span
                  size-1.5 shrink-0 rounded-full aria-hidden="true"
                  :class="status === 'OPEN' ? 'bg-green-500' : status === 'CONNECTING' ? 'bg-amber-500' : 'bg-zinc-400'"
                />
                {{ connectionStatus }}
              </span>
            </div>
            <dl mt-3 flex="~ items-center justify-between gap-3" aria-live="polite">
              <dt un-text="xs zinc-500 dark:zinc-400">
                当前页面人数
              </dt>
              <dd flex="~ items-baseline gap-1" whitespace-nowrap>
                <span text-xl font-medium leading-none tabular-nums>
                  {{ status === 'OPEN' ? pageVisitors ?? '—' : '—' }}
                </span>
                <span v-if="status === 'OPEN' && pageVisitors !== null" un-text="xs zinc-500 dark:zinc-400">人</span>
              </dd>
            </dl>
          </div>
          <div flex="~ items-start gap-2" bg="zinc-50 dark:zinc-800/50" px-4 py-3>
            <span i-mingcute:information-line size-3.5 shrink-0 mt-0.5 un-text="zinc-400 dark:zinc-500" aria-hidden="true" />
            <p min-w-0 break-words un-text="xs zinc-500 dark:zinc-400" leading-normal class="[text-wrap:pretty]">
              当你打开这个页面时，会自动建立 WebSocket 连接，当成功连接后服务器会推送当前浏览页面的人数。
            </p>
          </div>
        </HoverCard.Content>
      </HoverCard.Positioner>
    </Teleport>
  </HoverCard.Root>
</template>
