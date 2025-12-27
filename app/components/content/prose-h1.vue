<script setup lang="ts">
defineProps<{ id?: string }>()
</script>

<template>
  <h1 :id="id" class="group flex items-center">
    <span>
      <slot />
    </span>
    <a
      flex="inline"
      op="0 group-hover:100 focus:100"
      class="transition-opacity duration-200"
      role="button"
      tabindex="-1"
      aria-hidden="true"
      ml-2 select-none text-accent
      :href="`#${id}`"
    >
      <i class="i-mingcute:hashtag-line" size-1em aria-hidden="true" />
    </a>
  </h1>
</template>
