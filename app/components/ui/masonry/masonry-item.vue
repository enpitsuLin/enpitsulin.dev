<script setup lang="ts">
import { masonryContextKey } from './context'

const { as = 'div' } = defineProps<{
  as?: keyof HTMLElementTagNameMap
}>()

const item = useTemplateRef<HTMLElement>('item')
const content = useTemplateRef<HTMLDivElement>('content')
const masonry = inject(masonryContextKey)
if (!masonry)
  throw new Error('MasonryItem must be used inside Masonry.')

watch([item, content], ([itemElement, contentElement], _, onCleanup) => {
  if (itemElement && contentElement)
    onCleanup(masonry.registerItem(itemElement, contentElement))
}, { flush: 'post' })
</script>

<template>
  <component :is="as" ref="item" data-slot="masonry-item" min-w-0>
    <div ref="content" class="masonry-content" data-slot="masonry-content">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.masonry-content {
  display: flow-root;
  padding-block-end: var(--masonry-gap);
}
</style>
