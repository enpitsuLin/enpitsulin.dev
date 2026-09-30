<script setup lang="ts">
const { value = 0, label = '进度' } = defineProps<{
  value?: number
  label?: string
}>()

const percentage = computed(() => Math.round(Math.min(100, Math.max(0, value))))
</script>

<template>
  <div
    flex="~ items-center gap-2"
    role="progressbar" :aria-label="label"
    :aria-valuenow="percentage" :aria-valuemin="0" :aria-valuemax="100"
  >
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      class="size-5 text-accent" aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke-opacity="0.15" />
      <circle
        v-if="percentage > 0"
        cx="12" cy="12" r="9" pathLength="100"
        stroke-dasharray="100" :stroke-dashoffset="100 - percentage"
        stroke-linecap="round" transform="rotate(-90 12 12)"
      />
    </svg>
    <span text="xs zinc-700 dark:zinc-300" tabular-nums>{{ percentage }}%</span>
  </div>
</template>
