<script setup lang="ts">

</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    flex="~ wrap gap-1.5 sm:gap-2.5"
    class="break-words text-sm"
  >
    <slot />
  </ol>
</template>
