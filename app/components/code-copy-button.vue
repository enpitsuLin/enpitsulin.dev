<script setup lang="ts">
const { source } = defineProps<{ source: string }>()
const { copy, copied } = useClipboard({ source, legacy: true, copiedDuring: 800 })
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
    <i
      class="size-4"
      :class="[copied ? 'i-mingcute:check-fill' : 'i-mingcute:copy-2-fill']"
    />
  </button>
</template>
