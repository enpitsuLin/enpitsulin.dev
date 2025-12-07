<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'

defineProps<{
  thoughts: SerializeObject<Thought>[]
}>()
</script>

<template>
  <div relative w-full>
    <TransitionGroup
      tag="ul"
      leave-active-class="absolute"
      enter-from-class="opacity-0 translate-y-10 scale-x-80"
      leave-to-class="opacity-0 translate-y-10 scale-x-80"
    >
      <li v-for="(thought, index) in thoughts" :key="thought.id">
        <slot :thought="thought" :index="index" />
      </li>
    </TransitionGroup>
    <slot name="append" />
  </div>
</template>
