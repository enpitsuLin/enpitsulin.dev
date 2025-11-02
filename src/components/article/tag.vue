<script setup lang="ts">
import { ark } from '@ark-ui/vue/factory'

const { adChild = false, tag } = defineProps<{
  adChild?: boolean
  tag: string
}>()
</script>

<template>
  <RouterLink
    v-slot="{ href, navigate }"
    custom
    :to="{ name: '/(home)/blog/tags/[tag]', params: { tag } }"
  >
    <ark.a
      :as-child="adChild"
      :href
      p="x-2 y-1" rounded-md text-sm
      bg="zinc-100 active:zinc-200 hover:zinc-200 dark:zinc-700/50 dark:active:zinc-700/50 dark:hover:zinc-700"
      class="text-zinc-900 outline-offset-2 transition active:text-zinc-900/60 dark:text-zinc-400 active:transition-none dark:active:text-zinc-100/70 dark:hover:text-zinc-100"
      @click="navigate"
    >
      <span v-if="!$slots.default">{{ tag }}</span>
      <slot />
    </ark.a>
  </RouterLink>
</template>
