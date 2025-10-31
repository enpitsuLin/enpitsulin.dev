<script setup lang="ts">
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { computed, provide, ref } from 'vue'
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './constant'
import { SIDEBAR_CONTEXT_KEY } from './context'

defineOptions({
  inheritAttrs: true,
})

const { defaultOpen = true, open: modelOpen = undefined } = defineProps<{
  defaultOpen?: boolean
  open?: boolean | undefined
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const _open = ref(defaultOpen)

const open = computed({
  get() {
    return modelOpen ?? _open.value
  },
  set(value) {
    if (modelOpen !== undefined) {
      emit('update:open', value)
    }
    else {
      _open.value = value
    }
  },
})

const openMobile = ref(false)

const isMobile = useMediaQuery('(max-width: 767px)')

function toggleSidebar() {
  if (isMobile.value) {
    openMobile.value = !openMobile.value
  }
  else {
    _open.value = !_open.value
  }
}

useEventListener('keydown', (event) => {
  if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    toggleSidebar()
  }
})

provide(SIDEBAR_CONTEXT_KEY, {
  state: computed(() => open.value ? 'expanded' : 'collapsed'),
  open,
  openMobile,
  isMobile,
  toggleSidebar,
})
</script>

<template>
  <div
    data-slot="sidebar-wrapper"
    :style="{
      '--sidebar-width': SIDEBAR_WIDTH,
      '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
    }"
    w-full flex min-h-svh
    bg="sidebar"
    class="group/sidebar-wrapper"
  >
    <slot />
  </div>
</template>
