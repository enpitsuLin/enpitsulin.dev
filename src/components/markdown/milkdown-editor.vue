<script setup lang="ts">
import { Crepe } from '@milkdown/crepe'
import { listenerCtx } from '@milkdown/kit/plugin/listener'
import { Milkdown, useEditor } from '@milkdown/vue'

const { value } = defineProps<{ value: string }>()
const emit = defineEmits<{
  change: [value: string]
}>()

useEditor((root) => {
  const crepe = new Crepe({
    root,
    defaultValue: value,
  })

  crepe.editor.config((ctx) => {
    ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
      emit('change', markdown)
    })
  })
  return crepe
})
</script>

<template>
  <Milkdown />
</template>
