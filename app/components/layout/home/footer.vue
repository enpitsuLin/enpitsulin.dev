<script setup lang="ts">
const { navigation } = useAppConfig()
</script>

<template>
  <footer px="8 sm:12" border="t border" mt-50 w="full" pb-20 pt-10>
    <div flex="~ col gap-6 sm:row sm:items-center sm:justify-between">
      <div flex="~ col gap-2 items-center sm:items-start">
        <ul
          flex="~ gap-6"
          class="text-sm text-zinc-800 font-medium dark:text-zinc-200"
        >
          <li v-for="{ label, href } in navigation" :key="href">
            <NuxtLink :href class="transition hover:text-accent/80 dark:hover:text-accent">
              {{ label }}
            </NuxtLink>
          </li>
        </ul>
        <p class="text-xs text-zinc-600/50 dark:text-zinc-300/50">
          © {{ new Date().getFullYear() }} enpitsulin. All rights reserved.
        </p>
      </div>
      <div flex="~ col gap-2 items-center sm:items-end">
        <Visitors />
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          🚧 这个站点还在建设中...
        </p>
      </div>
    </div>
  </footer>
</template>
