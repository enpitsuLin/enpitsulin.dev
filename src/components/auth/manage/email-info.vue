<script setup lang="ts">
import type { User } from 'better-auth'
import { Collapsible } from '@ark-ui/vue/collapsible'
import { useMutation } from '@pinia/colada'

defineProps<{ user: User }>()

const { client } = useAuth()

const { mutate: sendVerificationEmail, isLoading } = useMutation({
  mutation(vars: string) {
    return client.sendVerificationEmail({ email: vars })
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
      <div relative text-xs flex="inline items-center gap-1">
        <div>{{ user.email }}</div>
        <div
          v-if="user.emailVerified"
          text-xs text-green-500
        >
          已验证
        </div>
        <div
          v-else
          text-xs text-red-500
        >
          未验证
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
      <template v-if="user.emailVerified">
        TODO
      </template>
      <template v-else>
        <div flex="~ col items-start gap-1">
          <div text-sm>
            验证电子邮件地址
          </div>
          <p text-xs op-70>
            验证您的电子邮件地址以确保您的账户安全
          </p>
          <button
            text-xs class="hover:underline"
            :disabled="isLoading"
            @click="sendVerificationEmail(user.email)"
          >
            发送验证邮件
          </button>
        </div>
      </template>
    </Collapsible.Content>
  </Collapsible.Root>
</template>
