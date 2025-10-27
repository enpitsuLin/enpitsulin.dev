<script setup lang="ts">
import type { Passkey } from 'better-auth/plugins/passkey'
import { Collapsible } from '@ark-ui/vue/collapsible'
import { useMutation, useQueryCache } from '@pinia/colada'

const props = defineProps<{
  passkey: Passkey
}>()

const { client } = useAuth()

const formatPasskey = computed(() => {
  return {
    name: props.passkey.name || '未命名通行密钥',
    deviceType: props.passkey.deviceType === 'singleDevice' ? '单设备' : '多设备',
    backedUp: props.passkey.backedUp ? '已备份' : '未备份',
    date: new Date(props.passkey.createdAt).toLocaleString(),
  }
})

const queryCache = useQueryCache()

const { mutate: removePasskey, isLoading } = useMutation({
  mutation(vars: Pick<Passkey, 'id'>) {
    return client.passkey.deletePasskey(vars)
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['passkeys'] })
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
      <div flex="~ col items-start gap-1 1" text-left text-xs>
        <div flex="~ items-center gap-2">
          <span>{{ formatPasskey.name }}</span>
          <div
            v-if="formatPasskey.backedUp === '已备份'"
            border="~ green-200 dark:green-700 rounded-lg" p="x1.5 y0.5" text-xs
            bg="green-100 dark:green-800"
            text-green-600 dark:text-green-400
          >
            已备份
          </div>
        </div>
        <div op-60>
          {{ formatPasskey.deviceType }} · {{ formatPasskey.date }}
        </div>
      </div>
      <Collapsible.Indicator
        class="transition-transform duration-200 data-[state=open]:rotate-180"
      >
        <div class="i-mingcute:down-line size-4" />
      </Collapsible.Indicator>
    </Collapsible.Trigger>
    <Collapsible.Content
      of-hidden p-4 space-y-2
      class="data-[state=closed]:animate-[accordion-up_100ms_ease-in-out] data-[state=open]:animate-[accordion-down_150ms_ease-in-out]"
    >
      <div flex="~ items-center gap-1" px-2>
        <div flex-1 space-y-1>
          <div text-sm>
            删除通行密钥
          </div>
          <p text-xs op-70>
            从您的账户中移除此通行密钥
          </p>
        </div>
        <button
          inline-block
          text-xs class="hover:underline"
          :disabled="isLoading"
          text-red-500
          @click="removePasskey({ id: passkey.id })"
        >
          删除
        </button>
      </div>
    </Collapsible.Content>
  </Collapsible.Root>
</template>
