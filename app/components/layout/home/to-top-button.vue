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
      class="[&:is(:hover,:active)_[class^=i-]]:scale-115 [&_[class^=i]]:transition-all size-8 bg-op-80"
      @click="y = 0"
    >
      <span class="sr-only">back to top</span>
      <div class="i-mingcute:up-line" />
    </button>
  </Transition>
</template>
