<script setup lang="ts">
import { Crepe } from '@milkdown/crepe'
import { Milkdown, useEditor } from '@milkdown/vue'

const { value } = defineProps<{ value: string }>()
const emit = defineEmits<{
  change: [value: string]
  blur: []
}>()

useEditor((root) => {
  const crepe = new Crepe({
    root,
    defaultValue: value,
    features: {
      latex: false,
    },
  })

  crepe.on((manager) => {
    manager.blur(() => {
      emit('blur')
    })
    manager.markdownUpdated((ctx, markdown) => {
      emit('change', markdown)
    })
  })

  return crepe
})
</script>

<template>
  <Milkdown />
</template>
