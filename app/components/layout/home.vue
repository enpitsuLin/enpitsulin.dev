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
      bg="zinc-50 dark:zinc-900" relative max-w-6xl shadow-lg
      class="ring-1 ring-zinc-100 dark:ring-zinc-300/20"
    >
      <LayoutHomeNavBar />
      <main relative mt-16 w="full" px="8 sm:12">
        <NuxtPage />
      </main>
      <div mt-auto aria-hidden="true" />
      <LayoutHomeFooter />
    </div>
    <Teleport to="#teleports">
      <LayoutHomeFab />
    </Teleport>
  </div>
</template>
