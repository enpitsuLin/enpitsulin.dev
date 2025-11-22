<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

const { source } = defineProps<{ source: string }>()
const { copy, copied } = useClipboard({ source, legacy: true, copiedDuring: 800 })
const copyIconVariants = {
  initial: {
    opacity: 1,
    scale: 1,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0,
  },
}
</script>

<template>
  <button
    type="button"
    bg="zinc-100 dark:zinc-900"
    flex="~ items-center justify-center"
    op="0 group-hover:100"
    rounded-md
    class="absolute right-2 top-2 z-1 p-2 text-xs backdrop-blur duration-200 transition-property-[opacity,transform] hover:scale-110"
    tabindex="0"
    aria-label="复制代码"
    @click="() => copy()"
  >
    <span class="sr-only">复制代码</span>
    <AnimatePresence mode="wait">
      <motion.div
        v-if="copied"
        v-bind="copyIconVariants"
        i-mingcute:check-fill size-4
      />
      <motion.div
        v-else
        v-bind="copyIconVariants"
        i-mingcute:copy-2-fill size-4
      />
    </AnimatePresence>
  </button>
</template>
