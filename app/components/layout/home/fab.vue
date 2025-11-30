<script setup lang="ts">
</script>

<template>
  <div
    bottom="5 sm:3rem" right="3 sm:3rem"
    flex="~ col items-center justify-between gap-y-2"
    border="~ border rounded-lg"
    bg="white/50 dark:zinc-900/50"
    class="shadow-black/10 shadow-md transition-all" fixed z-99 p-1
    backdrop-blur
  >
    <LayoutHomeAuthButton />
    <LayoutHomeThemeButton />
    <LayoutHomeToTopButton />
  </div>
</template>
