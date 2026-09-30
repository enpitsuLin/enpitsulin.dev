<script setup lang="ts">
import { masonryContextKey } from './context'

const { as = 'div', gap = '1rem' } = defineProps<{
  as?: keyof HTMLElementTagNameMap
  /** Space between items. Numbers are pixels; strings accept CSS lengths. */
  gap?: number | string
}>()

const items = shallowReactive(new Map<HTMLElement, HTMLElement>())
const measured = ref(false)

provide(masonryContextKey, {
  registerItem(item, content) {
    items.set(content, item)
    return () => {
      items.delete(content)
      item.style.removeProperty('grid-row-end')
    }
  },
})

// Native grid lanes also lay out server-rendered content before hydration.
if (import.meta.client && !CSS.supports('display', 'grid-lanes')) {
  useResizeObserver(() => [...items.keys()], (entries) => {
    for (const { target, borderBoxSize } of entries) {
      if (!(target instanceof HTMLElement))
        continue
      const item = items.get(target)
      if (!item)
        continue
      // Measure natural content plus its gutter, independent of the grid span.
      const height = borderBoxSize[0]?.blockSize ?? target.getBoundingClientRect().height
      const span = `span ${Math.max(1, Math.ceil(height))}`
      if (item.style.gridRowEnd !== span)
        item.style.gridRowEnd = span
    }
    measured.value = true
  }, { box: 'border-box' })
}
</script>

<template>
  <component
    :is="as"
    class="grid grid-gap-col-$masonry-gap [@support_(dispaly:_grid-lanes)]:([display:grid-lanes] [flow-tolerance:0])"
    data-slot="masonry"
    grid="cols-1"
    :auto-rows="measured ? '1px' : 'auto'"
    :style="{ '--masonry-gap': typeof gap === 'number' ? `${gap}px` : gap }"
  >
    <slot />
  </component>
</template>
