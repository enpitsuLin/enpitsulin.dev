<script setup lang="ts">
interface Props {
  date: string
}
const { date } = defineProps<Props>()

const formattedDate = useDateFormat(() => date, 'MMM DD YYYY', { locales: 'zh-Hans' })
</script>

<template>
  <time
    relative z-10 order-first mb-3
    flex="~ items-center" pl-3.5 text-sm
    text="zinc-500 dark:zinc-500"
    :datetime="date"
  >
    <span absolute inset-y-0 left-0 flex items-center aria-hidden="true">
      <span h-4 w-0.5 rounded-full bg="zinc-200 dark:zinc-500" />
    </span>
    {{ formattedDate }}
  </time>
</template>
