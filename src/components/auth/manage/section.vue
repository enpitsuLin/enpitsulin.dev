<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section space-y-2>
    <h4 op-70>
      {{ title }}
    </h4>
    <div div flex="~ col items-center gap-1">
      <slot />
    </div>
  </section>
</template>
