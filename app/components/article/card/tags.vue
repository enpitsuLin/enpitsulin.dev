<script setup lang="ts">
defineProps<{ tags: string[] }>()
</script>

<template>
  <div v-if="tags.length > 0" relative flex="~ gap-2" mt-3>
    <NuxtLink
      v-for="tag in tags"
      :key="tag"
      :to="{ name: 'blog-tag-tag-page', params: { tag } }"
      border="~ rounded zinc-200/50 dark:zinc-700/50"
      un-text="xs zinc-600 dark:zinc-500"
      bg="zinc-100/50 dark:zinc-800/50 hover:zinc-200/50 dark:hover:zinc-700/50"
      class="px-2 py-0.5"
    >
      # {{ tag }}
    </NuxtLink>
  </div>
</template>
