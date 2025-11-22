<script setup lang="ts">
interface MarqueeProps {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  vertical?: boolean
  repeat?: number
}
withDefaults(
  defineProps<MarqueeProps>(),
  {
    repeat: 4,
  },
)
</script>

<template>
  <div
    flex="~" of-hidden p-2
    class="group [--duration:40s] [--gap:1rem] gap-$gap"
    :class="{
      'flex-row': !vertical,
      'flex-col': vertical,
    }"
  >
    <div
      v-for="(_, i) in Array.from({ length: repeat })"
      :key="i"
      flex="~ justify-around gap-$gap shrink-0"
      :class="{
        'animate-marquee flex-row': !vertical,
        'animate-marquee-vertical flex-col': vertical,
        'group-hover:[animation-play-state:paused]': pauseOnHover,
        'animate-reverse!': reverse,
      }"
    >
      <slot v-bind="{ index: i }" />
    </div>
  </div>
</template>
