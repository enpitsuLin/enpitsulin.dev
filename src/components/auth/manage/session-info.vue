<script setup lang="ts">
import type { Session } from 'better-auth'
import { Collapsible } from '@ark-ui/vue/collapsible'
import { useMutation, useQueryCache } from '@pinia/colada'
import { UAParser } from 'ua-parser-js'
import SessionIconLaptop from './session-icon-laptop.vue'
import SessionIconMobile from './session-icon-mobile.vue'

const props = defineProps<{
  session: Session
}>()
const { session: currentSession, client } = useAuth()
const isCurrentSession = computed(() => props.session.id === currentSession.value.data?.session.id)

const formatSession = computed(() => {
  const { browser, device } = UAParser(props.session.userAgent ?? '')
  return {
    browser,
    device,
    date: new Date(props.session.updatedAt).toLocaleString(),
  }
})

const queryCache = useQueryCache()

const { mutate: revokeSession, isLoading } = useMutation({
  mutation(vars: Session) {
    return client.revokeSession(vars)
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['sessions'] })
  },
})
</script>

<template>
  <Collapsible.Root w-full>
    <Collapsible.Trigger
      bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
      flex="inline items-center justify-between gap-2"
      p="x4 y3" w-full rounded-lg
    >
      <div px-5>
        <template v-if="formatSession.device.type === 'mobile'">
          <SessionIconMobile size-20 />
        </template>
        <template v-else>
          <SessionIconLaptop size-20 />
        </template>
      </div>
      <div flex="~ col items-start gap-1 1" text-left text-xs>
        <div flex="~ items-center gap-2">
          <span>{{ formatSession.device.toString() }}</span>
          <div
            v-if="isCurrentSession"
            border="~ zinc-200 dark:zinc-700 rounded-lg" p="x1.5 y0.5" text-xs
            bg="zinc-100 dark:zinc-800"
          >
            此设备
          </div>
        </div>
        <div op-60>
          {{ formatSession.browser.name }} {{ formatSession.browser.version }}
        </div>
        <div op-60>
          {{ session.ipAddress || 'Unknown IP Address' }}
        </div>
        <time op-60 :datetime="formatSession.date">
          {{ formatSession.date }}
        </time>
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
      <template v-if="isCurrentSession">
        <div flex="~ col items-start gap-1">
          <div text-sm>
            当前设备
          </div>
          <p text-xs op-70>
            这是你目前正在使用的设备
          </p>
        </div>
      </template>
      <template v-else>
        <div flex="~ col items-start gap-1">
          <div text-sm>
            登出
          </div>
          <p text-xs op-70>
            从此设备上退出您的账户
          </p>
        </div>
        <button
          text-xs class="hover:underline"
          :disabled="isLoading"
          text-red-500
          @click="revokeSession(session)"
        >
          登出
        </button>
      </template>
    </Collapsible.Content>
  </Collapsible.Root>
</template>
