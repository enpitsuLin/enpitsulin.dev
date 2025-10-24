<script setup lang="ts">
const { y } = useWindowScroll()
</script>

<template>
  <Transition
    enter-active-class="transition-property-[height,opacity] duration-300 ease-in-out"
    leave-active-class="transition-property-[height,opacity] duration-300 ease-in-out"
    enter-from-class="h-0 op-0"
    leave-to-class="h-0 op-0"
  >
    <button
      v-if="y > 100"
      type="button"
      flex="~ items-center justify-center" of-hidden
      class="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
      @click="y = 0"
    >
      <span class="sr-only">back to top</span>
      <i inline-block class="i-mingcute:up-line" />
    </button>
  </Transition>
</template>
