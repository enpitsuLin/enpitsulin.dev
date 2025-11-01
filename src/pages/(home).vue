<script setup lang="ts">
defineOptions({
  name: 'HomeLayout',
})
</script>

<template>
  <div relative px="sm:8" flex="~ 1 justify-center">
    <div
      flex="~ 1 col items-center"
      px="lg:8" w="full"
      bg="white dark:zinc-900" relative max-w-6xl
      class="ring-1 ring-zinc-100 dark:ring-zinc-300/20"
    >
      <LayoutNavBar />
      <main relative mt-16 w="full" px="8 sm:12">
        <RouterView name="banner" />
        <RouterView />
      </main>
      <div mt-auto aria-hidden="true" />
      <LayoutFooter />
    </div>
  </div>
  <LayoutFab />
</template>
