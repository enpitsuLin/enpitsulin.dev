<script setup lang="ts">
</script>

<template>
  <div relative px="sm:8" flex="~ 1 justify-center">
    <div
      flex="~ 1 col items-center"
      px="lg:8" relative max-w-6xl w-full
      class="bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20"
    >
      <LayoutNavBar />
      <main relative mt-16 w-full px="8 sm:12">
        <RouterView />
      </main>
      <div mt-auto aria-hidden="true" />
      <LayoutFooter />
    </div>
  </div>
  <LayoutFab />
</template>
