<script setup lang="ts">
import { Tooltip } from '@ark-ui/vue/tooltip'
</script>

<template>
  <Tooltip.Root>
    <Tooltip.Trigger as-child>
      <slot />
    </Tooltip.Trigger>
    <Tooltip.Positioner>
      <Tooltip.Content
        bg="zinc-700 dark:zinc-300"
        un-text-background
        px-2 py-1.5 text-balance text-xs w-fit rounded-md
        class="data-[state=open]:animate-in data-[state=open]:fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=top]:slide-in-from-bottom-2 data-[placement=right]:slide-in-from-left-2 data-[placement=left]:slide-in-from-right-2"
      >
        <slot name="content" />
      </Tooltip.Content>
    </Tooltip.Positioner>
  </Tooltip.Root>
</template>
