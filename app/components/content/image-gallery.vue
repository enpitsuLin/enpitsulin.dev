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
    <ImagePreview v-slot="{ openImage, imageStyle }" :images="images">
      <div
        class="image-gallery group/gallery data-[layout=waterfall]:data-[single=false]:grid-cols-2 data-[layout=grid]:data-[single=false]:grid-cols-3 data-[layout=stack]:(grid-cols-[repeat(5,48px)] gap-0 justify-center isolate px-3 py-4) data-[layout=horizontal]:(flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:thin] p-1 pb-3)"
        :data-layout="layout" :data-single="images.length === 1" :data-odd="images.length % 2 !== 0"
        grid="~ cols-1" items-start gap-2
      >
        <a
          v-for="{ image, index } in visibleImages" :key="`${index}-${image.src}`"
          :href="image.src" target="_blank" rel="noopener noreferrer"
          :data-image-index="index"
          class="image-gallery-image group-data-[layout=waterfall]/gallery:group-data-[odd=true]/gallery:first:col-span-full group-data-[layout=grid]/gallery:aspect-square group-data-[layout=horizontal]/gallery:flex-none group-data-[layout=horizontal]/gallery:snap-start group-data-[layout=stack]/gallery:aspect-square group-data-[layout=stack]/gallery:w-15 group-data-[layout=stack]/gallery:border-2 group-data-[layout=stack]/gallery:border-white group-data-[layout=stack]/gallery:rounded-2px group-data-[layout=stack]/gallery:shadow-[0_2px_5px_rgb(0,0,0,0.15)] group-data-[layout=stack]/gallery:odd:-rotate-6 group-data-[layout=stack]/gallery:even:rotate-6 group-data-[layout=stack]/gallery:transition-transform group-data-[layout=stack]/gallery:duration-200 group-data-[layout=stack]/gallery:motion-reduce:transition-none group-data-[layout=stack]/gallery:hover:z-1 group-data-[layout=stack]/gallery:focus-visible:z-1 group-data-[layout=stack]/gallery:hover:scale-125 group-data-[layout=stack]/gallery:focus-visible:scale-125"
          relative block min-w-0
          overflow-hidden rounded-lg bg="zinc-100 dark:zinc-800"
          ring="focus-visible:2 focus-visible:accent" ring-offset-2
          :aria-label="`查看图片 ${index + 1} / ${images.length}：${image.alt || '图片'}${layout === 'grid' && index === 8 && images.length > 9 ? `，另有 ${images.length - 9} 张` : ''}`"
          @click="openImage($event, index)"
        >
          <img
            :src="image.src" :alt="image.alt || ''"
            :width="image.width" :height="image.height"
            :style="imageStyle(index)"
            loading="lazy" decoding="async" block
            class="group-data-[layout=horizontal]/gallery:w-auto group-data-[layout=horizontal]/gallery:h-50 group-data-[layout=horizontal]/gallery:max-w-none group-data-[layout=grid]/gallery:h-full group-data-[layout=grid]/gallery:object-cover group-data-[layout=stack]/gallery:h-full group-data-[layout=stack]/gallery:object-cover"
            w-full h-auto
          >
          <span
            v-if="layout === 'grid' && index === 8 && images.length > 9"
            absolute inset-0 flex="~ items-center justify-center"
            bg="black/55" un-text="white xl" aria-hidden="true"
          >
            +{{ images.length - 9 }}
          </span>
        </a>
      </div>
    </ImagePreview>
    <div v-if="layout === 'carousel' && images.length > 1" flex="~ items-center justify-center gap-3" mt-2>
      <button
        type="button" aria-label="上一张" :disabled="carouselIndex === 0"
        flex="~ items-center justify-center" size-9 rounded-full
        cursor="pointer disabled:default"
        bg="hover:zinc-100 dark:hover:zinc-700" op="disabled:40" ring="focus-visible:2 focus-visible:accent"
        @click="carouselIndex--"
      >
        <span i-mingcute-left-line aria-hidden="true" />
      </button>
      <span aria-live="polite" aria-atomic="true" un-text="sm zinc-500 dark:zinc-400">{{ carouselIndex + 1 }} / {{ images.length }}</span>
      <button
        type="button" aria-label="下一张" :disabled="carouselIndex === images.length - 1"
        flex="~ items-center justify-center" size-9 rounded-full
        cursor="pointer disabled:default"
        bg="hover:zinc-100 dark:hover:zinc-700" op="disabled:40" ring="focus-visible:2 focus-visible:accent"
        @click="carouselIndex++"
      >
        <span i-mingcute-right-line aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
