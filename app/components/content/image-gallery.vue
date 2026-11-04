<script setup lang="ts">
import type { GalleryImage } from '#shared/types/images'
import ImagePreview from '~/components/ui/image-preview.vue'

const props = defineProps<{ images: GalleryImage[], layout?: string }>()

const layouts = [
  'waterfall',
  'grid',
  'horizontal',
  'carousel',
  'stack',
  'none',
] as const
const carouselIndex = shallowRef(0)
const layout = computed(() => layouts.find(layout => layout === props.layout) || 'waterfall')
const visibleImages = computed(() => {
  const indexed = props.images.map((image, index) => ({ image, index }))
  if (layout.value === 'grid')
    return indexed.slice(0, 9)
  if (layout.value === 'carousel')
    return indexed.slice(carouselIndex.value, carouselIndex.value + 1)
  return indexed
})

watch(() => props.images, () => carouselIndex.value = 0)
</script>

<template>
  <div v-if="images.length && layout !== 'none'" class="not-prose">
    <ImagePreview v-slot="{ openImage }" :images="images">
      <div
        class="image-gallery" :data-layout="layout" :data-single="images.length === 1"
        :grid="layout === 'horizontal' ? undefined : '~'"
        :grid-cols="layout === 'stack' ? '[repeat(5,48px)]' : images.length === 1 || layout === 'carousel' ? '1' : layout === 'grid' ? '3' : '2'"
        :flex="layout === 'horizontal' ? '~' : undefined" items-start
        :gap="layout === 'stack' ? '0' : '2'" :justify="layout === 'stack' ? 'center' : undefined"
        :isolate="layout === 'stack' ? '' : undefined"
        :overflow-x="layout === 'horizontal' ? 'auto' : undefined"
        :snap="layout === 'horizontal' ? 'x mandatory' : undefined"
        :class="{ '[scrollbar-width:thin]': layout === 'horizontal' }"
        :p="layout === 'horizontal' ? '1 b-3' : layout === 'stack' ? 'x-3 y-4' : undefined"
      >
        <a
          v-for="{ image, index } in visibleImages" :key="`${index}-${image.src}`"
          :href="image.src" target="_blank" rel="noopener noreferrer"
          :data-image-index="index"
          :col-span="layout === 'waterfall' && images.length % 2 !== 0 && index === 0 ? 'full' : undefined"
          :aspect="layout === 'grid' || layout === 'stack' ? 'square' : undefined"
          :flex="layout === 'horizontal' ? 'none' : undefined" :snap="layout === 'horizontal' ? 'start' : undefined"
          :w="layout === 'stack' ? '15' : undefined" :border="layout === 'stack' ? '2 white' : undefined"
          :shadow="layout === 'stack' ? '[0_2px_5px_rgb(0,0,0,0.15)]' : undefined"
          :rotate="layout === 'stack' ? '$image-rotation' : undefined"
          :transition="layout === 'stack' ? 'transform duration-200 motion-reduce:none' : undefined"
          :z="layout === 'stack' ? 'hover:1 focus-visible:1' : undefined"
          :scale="layout === 'stack' ? 'hover:125 focus-visible:125' : undefined"
          :style="layout === 'stack' ? { '--image-rotation': `${index % 2 ? 6 : -6}deg` } : undefined"
          class="image-gallery-image"
          relative block min-w-0 overflow-hidden :rounded="layout === 'stack' ? '2px' : 'lg'" bg="zinc-100 dark:zinc-800"
          ring="focus-visible:2 focus-visible:accent" ring-offset-2
          :aria-label="`查看图片 ${index + 1} / ${images.length}：${image.alt || '图片'}${layout === 'grid' && index === 8 && images.length > 9 ? `，另有 ${images.length - 9} 张` : ''}`"
          @click="openImage($event, index)"
        >
          <img
            :src="image.src" :alt="image.alt || ''" :width="image.width" :height="image.height"
            loading="lazy" decoding="async" block
            :w="layout === 'horizontal' ? 'auto' : 'full'"
            :h="layout === 'horizontal' ? '50' : layout === 'grid' || layout === 'stack' ? 'full' : 'auto'"
            :max-w="layout === 'horizontal' ? 'none' : undefined"
            :object="layout === 'grid' || layout === 'stack' ? 'cover' : undefined"
          >
          <span
            v-if="layout === 'grid' && index === 8 && images.length > 9"
            absolute inset-0 flex="~ items-center justify-center" bg="black/55" un-text="white xl" aria-hidden="true"
          >
            +{{ images.length - 9 }}
          </span>
        </a>
      </div>
    </ImagePreview>
    <div v-if="layout === 'carousel' && images.length > 1" flex="~ items-center justify-center gap-3" mt-2>
      <button
        type="button" aria-label="上一张" :disabled="carouselIndex === 0"
        flex="~ items-center justify-center" size-9 rounded-full cursor="pointer disabled:default"
        bg="hover:zinc-100 dark:hover:zinc-700" op="disabled:40" ring="focus-visible:2 focus-visible:accent"
        @click="carouselIndex--"
      >
        <span i-mingcute-left-line aria-hidden="true" />
      </button>
      <span aria-live="polite" aria-atomic="true" un-text="sm zinc-500 dark:zinc-400">{{ carouselIndex + 1 }} / {{ images.length }}</span>
      <button
        type="button" aria-label="下一张" :disabled="carouselIndex === images.length - 1"
        flex="~ items-center justify-center" size-9 rounded-full cursor="pointer disabled:default"
        bg="hover:zinc-100 dark:hover:zinc-700" op="disabled:40" ring="focus-visible:2 focus-visible:accent"
        @click="carouselIndex++"
      >
        <span i-mingcute-right-line aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
