<script setup lang="ts">
import type { Spark } from '#shared/types/sparks'

defineProps<{ items: Spark[] }>()
const cells = useTemplateRefsList<HTMLLIElement>()
const measured = ref(false)

useResizeObserver(() => cells.value.map(cell => cell.querySelector('article')), (entries) => {
  for (const { target, borderBoxSize } of entries) {
    const cell = target.parentElement
    if (!cell)
      continue
    const height = borderBoxSize[0]?.blockSize ?? target.getBoundingClientRect().height
    // Include the bottom gutter while keeping the DOM in chronological order.
    cell.style.gridRowEnd = `span ${Math.ceil(height) + 16}`
  }
  measured.value = true
}, { box: 'border-box' })
</script>

<template>
  <ul
    aria-label="想法列表" grid="~ cols-1 md:cols-2 xl:cols-3"
    :auto-rows="measured ? '1px' : 'auto'" gap-x-4 w-full
  >
    <li
      v-for="(spark, index) in items" :key="spark.id" :ref="cells.set" min-w-0 pb-4
      fade-in slide-in-from-bottom-6
      animate="in duration-800! ease-$spring-easing! delay-$spark-enter-delay! fill-both! motion-reduce:none!"
      :style="{ '--spark-enter-delay': `${120 + Math.min(index, 5) * 60}ms` }"
    >
      <SparksCard :spark="spark" />
    </li>
  </ul>
</template>
