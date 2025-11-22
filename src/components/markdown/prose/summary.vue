<script setup lang="ts">
import { Collapsible } from '@ark-ui/vue/collapsible'
</script>

<template>
  <Collapsible.Trigger flex="~ items-center gap-2">
    <i class="i-mingcute:right-fill transition-transform group-data-[state=open]:rotate-90" />
    <span>
      <slot />
    </span>
  </Collapsible.Trigger>
</template>
