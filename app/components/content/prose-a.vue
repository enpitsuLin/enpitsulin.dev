<script setup lang="ts">
import type { AnchorHTMLAttributes } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs() as AnchorHTMLAttributes

function isExternalLink(url?: string) {
  const match = url?.match(/http[s?]:\/\//)
  if (!match)
    return false

  return match
}
</script>

<template>
  <template v-if="isExternalLink(attrs.href)">
    <span role="note" flex="inline items-center">
      <a
        :="attrs" decoration-none
        class="transition-property-[background-size] from-accent to-accent duration-250 hover:bg-[size:100%_2px]"
        bg="gradient-to-r no-repeat [position:left_bottom] [size:0_2px] "
      >
        <slot />
      </a>
      <i class="i-mingcute:arrow-right-up-line translate-y-2px op-70" inline-block />
    </span>
  </template>
  <template v-else>
    <NuxtLink :="attrs">
      <slot />
    </NuxtLink>
  </template>
</template>
