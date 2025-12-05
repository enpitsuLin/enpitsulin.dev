<script setup lang="ts">
const { user } = useUserSession()
</script>

<template>
  <div
    bottom="5 sm:3rem" right="3 sm:3rem"
    flex="~ col items-center justify-between gap-y-2"
    border="~ border rounded-lg"
    bg="white/50 dark:zinc-900/50"
    class="shadow-black/10 shadow-md transition-all" fixed z-99 p-1
    backdrop-blur
  >
    <UiTooltip
      v-if="user?.role === 'admin'"
      :positioning="{ placement: 'left' }"
    >
      <button
        type="button"
        flex="~ items-center justify-center" of-hidden
        class="[&:is(:hover,:active)_[class^=i-]]:scale-115 [&_[class^=i]]:transition-all size-8 bg-op-80"
      >
        <span class="sr-only">post a thought</span>
        <div i-mingcute:bulb-2-line />
      </button>
      <template #content>
        发表一些奇思妙想
      </template>
    </UiTooltip>
    <LayoutHomeThemeButton />
    <LayoutHomeToTopButton />
  </div>
</template>
