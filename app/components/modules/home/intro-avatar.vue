<script setup lang="ts">
const easterEgg = ref(false)
const inputQueue = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
const currentIndex = ref(0)

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === inputQueue[currentIndex.value]) {
    currentIndex.value++
    if (currentIndex.value === inputQueue.length) {
      easterEgg.value = true
      setTimeout(() => {
        easterEgg.value = false
        currentIndex.value = 0
      }, 1000)
    }
  }
  else {
    currentIndex.value = 0
  }
}

useEventListener('keydown', handleKeyDown)
</script>

<template>
  <div relative>
    <div :class="{ 'animate-spin': easterEgg }">
      <NuxtImg
        alt="avatar" width="250" height="250" decoding="async"
        class="border-[0.35rem] border-white rounded-full object-cover shadow-xl view-transition-avatar"
        src="/images/avatar.webp"
        fetchpriority="high"
      />
    </div>
    <span
      absolute bottom-0 right-0 cursor-default text-4xl
      class="transition-transform hover:animate-name-wave-hand hover:animate-duration-1000 hover:animate-iteration-infinite"
    >
      👋
    </span>
  </div>
</template>

<style>
::view-transition-group(avatar) {
  animation-duration: 300ms;
}
</style>
