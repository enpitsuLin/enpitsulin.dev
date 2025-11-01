<script setup lang="ts">

</script>

<template>
  <li
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    flex="inline items-center"
  >
    <div v-if="!$slots.default" i-mingcute:right-line size="3.5" />
    <slot />
  </li>
</template>
