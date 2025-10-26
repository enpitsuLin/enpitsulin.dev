<script setup lang="ts">
import type { Account } from 'better-auth'
import { Collapsible } from '@ark-ui/vue/collapsible'
import { useMutation, useQueryCache } from '@pinia/colada'
import AccountIcon from './account-icon.vue'

const props = defineProps<{
  account: Omit<Account, 'userId'>
}>()

const { client } = useAuth()

const formatAccount = computed(() => {
  return {
    providerName: getProviderDisplayName(props.account.providerId),
    date: new Date(props.account.createdAt).toLocaleString(),
    isExpired: props.account.accessTokenExpiresAt
      ? new Date(props.account.accessTokenExpiresAt) < new Date()
      : false,
  }
})

const queryCache = useQueryCache()

const { mutate: unlinkAccount, isLoading } = useMutation({
  mutation(vars: Pick<Account, 'providerId' | 'accountId'>) {
    return client.unlinkAccount({
      providerId: vars.providerId,
      accountId: vars.accountId,
    })
  },
  onSuccess() {
    queryCache.invalidateQueries({ key: ['accounts'] })
  },
})

function getProviderDisplayName(providerId: string): string {
  const providerMap: Record<string, string> = {
    google: 'Google',
    github: 'GitHub',
    discord: 'Discord',
    twitter: 'Twitter',
    facebook: 'Facebook',
    microsoft: 'Microsoft',
    apple: 'Apple',
    linkedin: 'LinkedIn',
  }
  return providerMap[providerId] || providerId.charAt(0).toUpperCase() + providerId.slice(1)
}
</script>

<template>
  <Collapsible.Root w-full>
    <Collapsible.Trigger
      bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
      flex="inline items-center justify-between gap-2"
      p="x4 y3" w-full rounded-lg
    >
      <AccountIcon
        size-8
        text="black dark:white"
        :provider-id="account.providerId"
      />
      <div flex="~ col items-start gap-1 1" text-left text-xs>
        <div flex="~ items-center gap-2">
          <span>{{ formatAccount.providerName }}</span>
          <div
            v-if="formatAccount.isExpired"
            border="~ orange-200 dark:orange-700 rounded-lg" p="x1.5 y0.5" text-xs
            bg="orange-100 dark:orange-800"
            text-orange-600 dark:text-orange-400
          >
            已过期
          </div>
        </div>
        <div op-60>
          连接时间: {{ formatAccount.date }}
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
      class="data-[state=closed]:animate-[accordion-up_200ms] data-[state=open]:animate-[accordion-down_250ms]"
    >
      <div flex="~ col items-start gap-1">
        <div text-sm>
          取消链接
        </div>
        <p text-xs op-70>
          从您的账户中移除此已连接的账户
        </p>
      </div>
      <button
        text-xs class="hover:underline"
        :disabled="isLoading"
        text-red-500
        @click="unlinkAccount(account)"
      >
        取消链接
      </button>
    </Collapsible.Content>
  </Collapsible.Root>
</template>
