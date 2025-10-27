<script setup lang="ts">
import { Avatar } from '@ark-ui/vue/avatar'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useInView } from 'motion-v'
import { useAuth } from '~/composables/auth'
import Section from './section.vue'

const { user, client, loggedIn } = useAuth()
const accountSectionTitle = useTemplateRef('accountSectionTitle')
const inView = useInView(accountSectionTitle)

const queryCache = useQueryCache()

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

defineExpose({
  scrollIntoView: () => [
    accountSectionTitle.value?.scrollIntoView({
      behavior: 'smooth',
    }),
  ],
  inView,
})
</script>

<template>
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
        <AuthManageEmailInfo :user />
      </template>
    </Section>
    <Section title="已连接的账户">
      <template v-if="isAccountsPending">
        <AuthManageAccountSkeleton
          v-for="i in 1"
          :key="`skeleton-${i}`"
        />
      </template>
      <template v-else>
        <AuthManageAccountInfo
          v-for="account in accounts"
          :key="account.accountId"
          :account="account"
        />
      </template>
      <button
        v-if="accounts?.length === 0"
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
</template>
