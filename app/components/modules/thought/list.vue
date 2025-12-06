<script setup lang="ts">
</script>

<template>
  <div
    relative w-full
  >
    <TransitionGroup
      leave-active-class="absolute"
      enter-from-class="opacity-0 translate-y-10 scale-x-80"
      leave-to-class="opacity-0 translate-y-10 scale-x-80"
    >
      <slot />
    </TransitionGroup>
    <slot name="append" />
  </div>
</template>
