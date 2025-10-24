<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { motion } from 'motion-v'

defineProps<{
  href: RouteLocationRaw
}>()
</script>

<template>
  <RouterLink
    flex="~ items-center justify-center"
    h-full w-full cursor-pointer px-3
    :to="href"
    class="navbar-link relative transition-color hover:text-zinc-9 dark:hover:text-zinc-6"
  >
    <template #default="{ isActive }">
      <motion.div
        v-if="isActive"
        layout-id="navbar-link"
        class="absolute inset-0 rounded-full bg-white shadow-md dark:bg-zinc-200"
      />
      <span class="relative">
        <slot />
      </span>
    </template>
  </RouterLink>
</template>
