<script setup lang="ts">
import type { GalleryImage } from '#shared/types/images'
import { Dialog } from '@ark-ui/vue/dialog'

const props = defineProps<{ images: GalleryImage[] }>()

const isOpen = shallowRef(false)
const previewImage = useTemplateRef<HTMLImageElement>('previewImage')
const open = computed({
  get: () => isOpen.value,
  set(value: boolean) {
    if (value === isOpen.value)
      return
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isOpen.value = value
      return
    }

    const transition = document.startViewTransition(async () => {
      isOpen.value = value
      await nextTick()
      if (value)
        await previewImage.value?.decode().catch(() => {})
    })
    // A newer transition may skip this animation without cancelling the state update.
    transition.ready.catch(() => {})
  },
})
const activeIndex = shallowRef(0)
const zoomed = shallowRef(false)
const loaded = shallowRef(false)
const failed = shallowRef(false)
const viewport = useTemplateRef<HTMLDivElement>('viewport')
const title = useTemplateRef<HTMLHeadingElement>('title')
const current = computed(() => props.images[activeIndex.value])
const transitionName = `image-preview-${useId()}`
const previewSrc = shallowRef<string>()
let trigger: HTMLElement | null = null

function imageStyle(index = 0) {
  return {
    viewTransitionName: !open.value && activeIndex.value === index
      ? transitionName
      : 'none',
    viewTransitionClass: 'image-preview',
  }
}

function openImage(event: MouseEvent, index = 0) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0 || !props.images[index])
    return
  event.preventDefault()
  trigger = event.currentTarget instanceof HTMLElement
    ? event.currentTarget
    : null
  activeIndex.value = index
  // Reuse the decoded thumbnail, including NuxtImg's optimized URL, for the snapshot.
  previewSrc.value = trigger?.querySelector('img')?.currentSrc || props.images[index]?.src
  open.value = true
}

function changeImage(step: number) {
  activeIndex.value = Math.min(props.images.length - 1, Math.max(0, activeIndex.value + step))
  previewSrc.value = current.value?.src
}

watch([
  open,
  () => current.value?.src,
], () => {
  zoomed.value = false
  loaded.value = false
  failed.value = false
  viewport.value?.scrollTo(0, 0)
})
watch(() => props.images, (images) => {
  if (!images.length)
    open.value = false
  activeIndex.value = Math.min(activeIndex.value, Math.max(0, images.length - 1))
})

function onKeydown(event: KeyboardEvent) {
  if (zoomed.value || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
    return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    changeImage(event.key === 'ArrowLeft'
      ? -1
      : 1)
  }
}

useSwipe(viewport, {
  threshold: 50,
  onSwipeEnd(event, direction) {
    if (zoomed.value || event.touches.length)
      return
    if (direction === 'left' || direction === 'right') {
      changeImage(direction === 'left'
        ? 1
        : -1)
    }
  },
})
</script>

<template>
  <Dialog.Root
    v-model:open="open" lazy-mount unmount-on-exit
    :initial-focus-el="() => title"
    :final-focus-el="() => trigger"
  >
    <slot :open-image="openImage" :image-style="imageStyle" />
    <Teleport to="#teleports">
      <Dialog.Backdrop fixed inset-0 z-100 bg="black/80" />
      <Dialog.Positioner fixed inset-0 z-101>
        <Dialog.Content
          class="image-preview not-prose focus:[outline:none]" un-text="white"
          absolute inset-0 w-full h-100dvh
          @keydown="onKeydown"
        >
          <Dialog.Title as-child>
            <!-- Start on static content so arrow shortcuts do not highlight an unrelated control. -->
            <h2 ref="title" tabindex="-1" sr-only>
              图片预览
            </h2>
          </Dialog.Title>
          <div absolute inset-x-0 top-0 z-2 flex="~ items-center justify-end gap-2" p="2 sm:4">
            <span v-if="images.length > 1" mr-auto pl-2 un-text="sm" aria-live="polite" aria-atomic="true">
              {{ activeIndex + 1 }} / {{ images.length }}
            </span>
            <button
              type="button" class="preview-control" :disabled="!loaded || failed"
              flex="inline none items-center justify-center" size-11 rounded-full
              cursor="pointer disabled:default" bg="black/45 hover:zinc-700" op="disabled:40"
              outline="focus-visible:2 focus-visible:solid focus-visible:white focus-visible:offset-[-3px]"
              :aria-label="zoomed ? '适应窗口' : '查看原始尺寸'" :aria-pressed="zoomed"
              @click="zoomed = !zoomed"
            >
              <span
                :i-mingcute-zoom-out-line="zoomed ? '' : undefined"
                :i-mingcute-zoom-in-line="zoomed ? undefined : ''" aria-hidden="true"
              />
            </button>
            <a
              v-if="current" :href="current.src" target="_blank" rel="noopener noreferrer"
              class="preview-control" aria-label="打开原图"
              flex="inline none items-center justify-center" size-11 rounded-full
              cursor="pointer disabled:default" bg="black/45 hover:zinc-700" op="disabled:40"
              outline="focus-visible:2 focus-visible:solid focus-visible:white focus-visible:offset-[-3px]"
            >
              <span i-mingcute-external-link-line aria-hidden="true" />
            </a>
            <Dialog.CloseTrigger as-child>
              <button
                type="button" class="preview-control" aria-label="关闭图片预览"
                flex="inline none items-center justify-center" size-11 rounded-full
                cursor="pointer disabled:default" bg="black/45 hover:zinc-700" op="disabled:40"
                outline="focus-visible:2 focus-visible:solid focus-visible:white focus-visible:offset-[-3px]"
              >
                <span i-mingcute-close-line aria-hidden="true" />
              </button>
            </Dialog.CloseTrigger>
          </div>
          <div
            ref="viewport" :data-zoomed="zoomed"
            class="preview-viewport [container-type:size]"
            outline="focus-visible:2 focus-visible:solid focus-visible:white focus-visible:offset-[-3px]"
            size-full py-18 px="2 sm:18" overflow-auto overscroll-contain
            :tabindex="zoomed ? 0 : undefined" role="region" aria-label="图片浏览区域"
            @click.self="open = false"
          >
            <div class="preview-canvas" grid place-items-center min-w-full min-h-full w-max @click.self="open = false">
              <p v-if="failed" role="alert" p-6>
                图片加载失败，可打开原图重试。
              </p>
              <img
                v-else-if="current" :key="current.src" ref="previewImage" :src="previewSrc || current.src"
                :alt="current.alt || ''"
                class="preview-image" :data-zoomed="zoomed" decoding="async"
                :style="{ viewTransitionName: open ? transitionName : 'none', viewTransitionClass: 'image-preview' }"
                block w-auto h-auto object-contain
                :max-w="zoomed ? 'none' : '[100cqw]'" :max-h="zoomed ? 'none' : '[100cqh]'"
                @load="loaded = true" @error="failed = true"
              >
            </div>
          </div>
          <template v-if="images.length > 1">
            <button
              type="button" class="preview-control preview-prev" left="[max(0.75rem,env(safe-area-inset-left))]"
              flex="inline none items-center justify-center" size-11 rounded-full
              cursor="pointer disabled:default" bg="black/45 hover:zinc-700" op="disabled:40"
              outline="focus-visible:2 focus-visible:solid focus-visible:white focus-visible:offset-[-3px]"
              absolute top="1/2" z-2 translate-y="-1/2"
              aria-label="上一张" :disabled="activeIndex === 0" @click="changeImage(-1)"
            >
              <span i-mingcute-left-line aria-hidden="true" />
            </button>
            <button
              type="button" class="preview-control preview-next" right="[max(0.75rem,env(safe-area-inset-right))]"
              flex="inline none items-center justify-center" size-11 rounded-full
              cursor="pointer disabled:default" bg="black/45 hover:zinc-700" op="disabled:40"
              outline="focus-visible:2 focus-visible:solid focus-visible:white focus-visible:offset-[-3px]"
              absolute top="1/2" z-2 translate-y="-1/2"
              aria-label="下一张" :disabled="activeIndex === images.length - 1" @click="changeImage(1)"
            >
              <span i-mingcute-right-line aria-hidden="true" />
            </button>
          </template>
        </Dialog.Content>
      </Dialog.Positioner>
    </Teleport>
  </Dialog.Root>
</template>

<style>
::view-transition-group(*.image-preview) {
  animation-duration: 300ms;
  animation-timing-function: ease-in-out;
}
</style>
