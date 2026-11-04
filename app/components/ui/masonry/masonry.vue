<script setup lang="ts">
import { masonryContextKey } from './context'

const { as = 'div', gap = '1rem' } = defineProps<{
  as?: keyof HTMLElementTagNameMap
  /** Space between items. Numbers are pixels; strings accept CSS lengths. */
  gap?: number | string
}>()

const items = shallowReactive(new Map<HTMLElement, HTMLElement>())
const measured = ref(false)
const supportsGridLanes = useSupported(() => typeof CSS !== 'undefined' && CSS.supports('display', 'grid-lanes'))

function updateSpan(item: HTMLElement, height: number) {
  const span = `span ${Math.max(1, Math.ceil(height))}`
  if (item.style.gridRowEnd !== span)
    item.style.gridRowEnd = span
}

provide(masonryContextKey, {
  registerItem(item, content) {
    items.set(content, item)
    if (!supportsGridLanes.value) {
      // offsetHeight is unaffected by the card's entrance animation.
      updateSpan(item, content.offsetHeight)
      measured.value = true
    }
    return () => {
      items.delete(content)
      item.style.removeProperty('grid-row-end')
    }
  },
})

// Native grid lanes also lay out server-rendered content before hydration.
useResizeObserver(() => supportsGridLanes.value
  ? []
  : [
      ...items.keys(),
    ], (entries) => {
  for (const { target, borderBoxSize } of entries) {
    if (!(target instanceof HTMLElement))
      continue
    const item = items.get(target)
    if (!item)
      continue
    // Measure natural content plus its gutter, independent of the grid span.
    const height = borderBoxSize[0]?.blockSize ?? target.offsetHeight
    updateSpan(item, height)
  }
  measured.value = true
}, { box: 'border-box' })
</script>

<template>
  <component
    :is="as"
    class="grid grid-gap-col-$masonry-gap"
    data-slot="masonry"
    grid="cols-1"
    :auto-rows="measured ? '1px' : 'auto'"
    :style="{ '--masonry-gap': typeof gap === 'number' ? `${gap}px` : gap }"
  >
    <slot />
  </component>
</template>

<style scoped>
@supports (display: grid-lanes) {
  [data-slot='masonry'] {
    display: grid-lanes;
    flow-tolerance: 0;
  }
}
</style>
