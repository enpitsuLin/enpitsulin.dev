<script setup lang="ts">
const { navigation } = useAppConfig()

const { visitors, status } = useVisitors()
</script>

<template>
  <footer px="8 sm:12" border="t border" mt-50 w="full" pb-20 pt-10>
    <div flex="~ col items-center justify-between gap-6 sm:row">
      <div
        flex="~ gap-6"
        class="text-sm text-zinc-800 font-medium dark:text-zinc-200"
      >
        <NuxtLink
          v-for="{ label, href } in navigation"
          :key="href"
          :href
          class="transition hover:text-accent/80 dark:hover:text-accent"
        >
          {{ label }}
        </NuxtLink>
      </div>
      <div space-y-1>
        <div flex="~ gap-1 items-center">
          <div i-mingcute:group-3-line animate-bounce text-green />
          <span class="text-xs text-zinc-600 dark:text-zinc-300">
            {{ status === 'OPEN' ? `在线伙伴: ${visitors}` : '连接中...' }}
          </span>
        </div>
        <p class="text-sm text-zinc-600 dark:text-zinc-300">
          © {{ new Date().getFullYear() }} - enpitsulin
        </p>
        <small op-50 text-xs>
          🚧 这个站点还在建设中...
        </small>
      </div>
    </div>
  </footer>
</template>
