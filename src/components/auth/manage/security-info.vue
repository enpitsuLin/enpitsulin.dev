<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { useInView } from 'motion-v'
import Section from './section.vue'

const { client, loggedIn, session } = useAuth()

const securitySectionTitle = useTemplateRef('securitySectionTitle')
const inView = useInView(securitySectionTitle)

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

const { data: passkeys, isPending: isPasskeysPending } = useQuery({
  key: () => ['passkeys', loggedIn.value],
  query: async () => client.passkey.listUserPasskeys({
    fetchOptions: { throw: true },
  }),
  enabled: () => loggedIn.value,
})

defineExpose({
  scrollIntoView: () => [
    securitySectionTitle.value?.scrollIntoView({
      behavior: 'smooth',
    }),
  ],
  inView,
})
</script>

<template>
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
        <AuthManagePasskeySkeleton
          v-for="i in 1"
          :key="`skeleton-${i}`"
        />
      </template>
      <template v-else>
        <AuthManagePasskeyInfo
          v-for="passkey in passkeys"
          :key="passkey.id"
          :passkey="passkey"
        />
      </template>
      <AuthManagePasskeyAddPasskey />
    </Section>
    <Section title="活动设备">
      <template v-if="isDevicesPending">
        <AuthManageSessionSkeleton
          v-for="i in 1"
          :key="`skeleton-${i}`"
        />
      </template>
      <template v-else>
        <AuthManageSessionInfo
          v-for="s in sessions"
          :key="s.id"
          :session="s"
        />
      </template>
    </Section>
  </div>
</template>
