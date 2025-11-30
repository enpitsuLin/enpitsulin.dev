<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div flex="~ col items-center" pt-10>
    <header pb="10 md:20" w-full>
      <h2
        pb-10 text="4xl md:6xl"
        class="animate-in fade-in slide-in-from-left-16 animate-duration-800! animate-ease-$spring-easing!"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="animate-delay-100 text-sm op-60 animate-in fade-in slide-in-from-left-16 animate-duration-1000! animate-ease-$spring-easing! md:text-base"
      >
        {{ description }}
      </p>
      <slot name="header" />
    </header>
    <slot />
  </div>
</template>
