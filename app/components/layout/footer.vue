<script setup lang="ts">
const { navigation } = useAppConfig()
</script>

<template>
  <footer px="8 sm:12" border="t border" mt-50 w="full" pb-20 pt-10>
    <div flex="~ col items-center justify-between gap-6 sm:row">
      <div class="flex gap-6 text-sm text-zinc-800 font-medium dark:text-zinc-200">
        <NuxtLink
          v-for="{ label, href } in navigation"
          :key="href"
          :href
          class="transition hover:text-accent/80 dark:hover:text-accent"
        >
          {{ label }}
        </NuxtLink>
      </div>
      <p class="text-sm text-zinc-600 dark:text-zinc-300">
        © {{ new Date().getFullYear() }} - enpitsulin
      </p>
    </div>
  </footer>
</template>
