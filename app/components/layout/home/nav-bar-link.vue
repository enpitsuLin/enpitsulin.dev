<script setup lang="ts">
import { motion } from 'motion-v'

const { href } = defineProps<{
  href: string
}>()
const route = useRoute()

const isActive = computed(() => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.matched.some(match => match.path === href)
})
</script>

<template>
  <NuxtLink
    :data-active="isActive"
    flex="~ items-center justify-center"
    h="full" w="full"
    un-text="data-[active=true]:zinc-200 dark:data-[active=true]:zinc-800 zinc-800 dark:zinc-200 op-70 data-[active=true]:op-100 hover:op-100"
    class="navbar-link relative transition-color "
    cursor-pointer px-3
    :to="href"
  >
    <motion.div
      v-if="isActive"
      layout-id="navbar-link"
      bg="zinc-800 dark:zinc-200"
      class="absolute inset-0 rounded-full shadow-md"
      :style="{
        originY: 'top', // workaround https://github.com/motiondivision/motion/issues/1535
      }"
    />
    <span class="relative">
      <slot />
    </span>
  </NuxtLink>
</template>
