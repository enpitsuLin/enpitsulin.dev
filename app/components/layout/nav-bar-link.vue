<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { motion } from 'motion-v'

defineProps<{
  href: RouteLocationRaw
}>()
</script>

<template>
  <NuxtLink
    custom
    :to="href"
  >
    <template #default="{ href, navigate, isActive, isExactActive }">
      <a
        :data-active="href === '/' ? isExactActive : isActive"
        flex="~ items-center justify-center"
        h="full" w="full"
        un-text="data-[active=true]:zinc-200 dark:data-[active=true]:zinc-800 zinc-800 dark:zinc-200 op-70 data-[active=true]:op-100 hover:op-100"
        class="navbar-link relative transition-color"
        cursor-pointer px-3
        :href="href"
        @click="navigate"
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
      </a>
    </template>
  </NuxtLink>
</template>
