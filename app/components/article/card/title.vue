<script setup lang="ts">
defineProps<{
  path: string
  title?: string
}>()
</script>

<template>
  <h2 text="base zinc-800 dark:zinc-100" tracking-tight>
    <div
      absolute z-0 op="0 group-hover:100"
      bg="zinc-200/50 dark:zinc-800/50"
      class="scale-95 transition -inset-x-4 -inset-y-6 group-hover:scale-100 sm:rounded-2xl sm:-inset-x-6"
    />
    <NuxtLink :to="path">
      <span
        absolute z-20
        class="-inset-x-4 -inset-y-6 sm:rounded-2xl sm:-inset-x-6"
      />
      <span relative z-10>{{ title ?? "Untitled Post" }}</span>
    </NuxtLink>
  </h2>
</template>
