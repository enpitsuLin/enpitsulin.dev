<script setup lang="ts">
defineProps<{
  providerId: string
}>()

function getProviderIcon(providerId: string): string {
  const iconMap: Record<string, string> = {
    github: 'i-logos:github-icon',
  }
  return iconMap[providerId] || 'i-mingcute:user-4-line'
}
</script>

<template>
  <div :class="getProviderIcon(providerId)" />
</template>
