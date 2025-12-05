<script setup lang="ts">
const colorMode = useColorMode()

function onClick() {
  const toggle = () => {
    colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
  }
  if (!document.startViewTransition) {
    toggle()
    return
  }
  const viewTransition = document.startViewTransition(toggle)
  viewTransition.ready.then(() => {
    document.documentElement.classList.add('theme-toggle-animating')
  })
  viewTransition.finished.then(() => {
    document.documentElement.classList.remove('theme-toggle-animating')
  })
}
</script>

<template>
  <button
    type="button"
    flex="~ items-center justify-center" of-hidden
    class="[&:is(:hover,:active)_[class^=i-]]:scale-115 [&_[class^=i]]:transition-all size-8 bg-op-80"
    @click="onClick"
  >
    <span class="sr-only">change dark mode</span>
    <ClientOnly>
      <div v-if="colorMode.preference === 'dark'" class="i-mingcute:moon-line" />
      <div v-else-if="colorMode.preference === 'light'" class="i-mingcute:sun-line" />
      <div v-else class="i-mingcute:computer-line" />
      <template #fallback>
        <div class="i-mingcute:computer-line" />
      </template>
    </ClientOnly>
  </button>
</template>

<style>
.theme-toggle-animating::view-transition-group(root) {
  animation-duration: 0.8s;
}
.theme-toggle-animating::view-transition-new(root),
.theme-toggle-animating::view-transition-old(root) {
  mix-blend-mode: normal;
}

.theme-toggle-animating::view-transition-new(root) {
  animation-name: reveal-light;
}

.theme-toggle-animating::view-transition-old(root),
.theme-toggle-animating.dark::view-transition-old(root) {
  animation: none;
}
.theme-toggle-animating.dark::view-transition-new(root) {
  animation-name: reveal-dark;
}

@keyframes reveal-dark {
  from {
    clip-path: polygon(-30% 0, -30% 0, -15% 100%, -10% 115%);
  }
  to {
    clip-path: polygon(-30% 0, 130% 0, 115% 100%, -10% 115%);
  }
}

@keyframes reveal-light {
  from {
    clip-path: polygon(130% 0, 130% 0, 115% 100%, 110% 115%);
  }
  to {
    clip-path: polygon(130% 0, -30% 0, -15% 100%, 110% 115%);
  }
}
</style>
