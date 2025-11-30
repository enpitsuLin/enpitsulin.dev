<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo'

const props = defineProps<{
  src: string
  alt?: string
  width?: string | number
  height?: string | number
}>()

const id = useId()

const { load, unload, isLoaded } = useStyleTag(` 
.zoom-image-animating :not([data-view-transition-name='zoom-${id}']) {
  view-transition-name: none !important;
}
`, { immediate: false })

const refinedSrc = computed(() => {
  if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
    if (_base !== '/' && !props.src.startsWith(_base))
      return joinURL(_base, props.src)
  }
  return props.src
})

const supportsViewTransition = useSupported(() => 'startViewTransition' in document)

const [zoom, toggleZoom] = useToggle(false)
const toggleImageZoom = useDebounceFn(() => {
  const toggle = () => {
    isLoaded.value ? unload() : load()
    toggleZoom()
  }
  if (!supportsViewTransition.value) {
    toggle()
    return
  }
  document.documentElement.classList.add('zoom-image-animating')
  const viewTransition = document.startViewTransition(() => {
    toggle()
  })
  viewTransition.finished.then(() => {
    document.documentElement.classList.remove('zoom-image-animating')
  })
}, 100)

useEventListener('wheel', () => {
  if (zoom.value) {
    toggleImageZoom()
  }
})
</script>

<template>
  <figure flex="~ col items-center">
    <NuxtImg
      :data-view-transition-name="`zoom-${id}`"
      :src="refinedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :class="{
        'cursor-zoom-in': !zoom,
        'invisible': zoom,
      }"
      :style="!zoom && { viewTransitionName: `zoom-${id}` }"
      @click="toggleImageZoom"
    />
    <figcaption v-if="alt" mt-1 flex="~ col items-center justify-center">
      <hr op-80 class="my-3 h-[0.5px] w-[80px] border-0 bg-black/30 dark:bg-white/30">
      <span>{{ alt }}</span>
    </figcaption>
  </figure>
  <Teleport to="#teleports">
    <div
      role="dialog"
      flex="~ items-center justify-center"
      class="fixed inset-0 z-99 cursor-zoom-out backdrop-blur-0.5rem"
      bg="zinc-50/80 dark:zinc-950/80"
      :class="{
        invisible: !zoom,
      }"
      @click="toggleImageZoom"
    >
      <NuxtImg
        :data-view-transition-name="`zoom-${id}`"
        :src="refinedSrc"
        :alt="alt"
        :width="width"
        :height="height"
        :style="zoom && { viewTransitionName: `zoom-${id}` }"
      />
    </div>
  </Teleport>
</template>
