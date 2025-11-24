<script setup lang="ts">
import { useSidebar } from './context'

const { toggleSidebar } = useSidebar()
</script>

<template>
  <button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    flex="inline items-center justify-center gap-2 shrink-0"
    size-8 whitespace-nowrap rounded-md text-sm font-medium outline-none
    bg="~ focus-visible:zinc-300 hover:zinc-100 dark:hover:zinc-700"
    un-text="hover:zinc-900 dark:hover:zinc-100 "
    border="dark:focus-visible:zinc-600"
    class="transition-all -ml-1 focus-visible:ring-3px focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-700"
    @click="toggleSidebar"
  >
    <i class="i-carbon:open-panel-left size-5" />
    <span class="sr-only">Toggle Sidebar</span>
  </button>
</template>
