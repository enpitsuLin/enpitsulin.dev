<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  to: RouteLocationRaw
}>()
</script>

<template>
  <li
    data-slot="breadcrumb-item"
    flex="inline items-center gap-1.5"
  >
    <RouterLink
      data-slot="breadcrumb-link"
      :to="to"
    >
      <slot />
    </RouterLink>
  </li>
</template>
