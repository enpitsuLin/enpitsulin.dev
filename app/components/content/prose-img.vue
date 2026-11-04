<script setup lang="ts">
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo'
import ImagePreview from '~/components/ui/image-preview.vue'

const props = defineProps<{
  src: string
  alt?: string
  width?: string | number
  height?: string | number
}>()

const config = useRuntimeConfig()
const refinedSrc = computed(() => {
  if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
    const base = withLeadingSlash(withTrailingSlash(config.app.baseURL))
    if (base !== '/' && !props.src.startsWith(base))
      return joinURL(base, props.src)
  }
  return props.src
})
const images = computed(() => [
  {
    src: refinedSrc.value,
    alt: props.alt,
    width: props.width,
    height: props.height,
  },
])
</script>

<template>
  <ImagePreview v-slot="{ openImage, imageStyle }" :images="images">
    <figure flex="~ col items-center">
      <a
        :href="refinedSrc" target="_blank" rel="noopener noreferrer"
        block max-w-full cursor-zoom-in rounded ring="focus-visible:2 focus-visible:accent"
        :aria-label="alt ? `查看图片：${alt}` : '查看图片'"
        @click="openImage($event)"
      >
        <NuxtImg
          :src="refinedSrc" :alt="alt || ''" :width="width" :height="height"
          :style="imageStyle()"
          loading="lazy" decoding="async" max-w-full h-auto
        />
      </a>
      <figcaption v-if="alt" mt-1 un-text="sm center">
        {{ alt }}
      </figcaption>
    </figure>
  </ImagePreview>
</template>
