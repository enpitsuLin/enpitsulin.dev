<script setup lang="ts">
import { CollapsibleTrigger } from '@ark-ui/vue'
</script>

<template>
  <CollapsibleTrigger flex="~ items-center gap-2">
    <i class="i-mingcute:right-fill transition-transform group-data-[state=open]:rotate-90" />
    <span>
      <slot />
    </span>
  </CollapsibleTrigger>
</template>
