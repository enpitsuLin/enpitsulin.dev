<script setup lang="ts">
import ReviewScore from './review-score.vue'

const props = defineProps<{
  scores: { label: string, score: number, comment: string }[]
}>()

function point(index: number, radius: number) {
  const angle = index * 2 * Math.PI / props.scores.length - Math.PI / 2
  return { x: 160 + Math.cos(angle) * radius, y: 140 + Math.sin(angle) * radius }
}

const axes = computed(() => props.scores.map((item, index) => ({
  ...item,
  end: point(index, 82),
  value: point(index, item.score / 10 * 82),
  labelPosition: point(index, 114),
})))
const grid = computed(() => [2, 4, 6, 8, 10].map(score =>
  props.scores.map((_, index) => {
    const { x, y } = point(index, score / 10 * 82)
    return `${x},${y}`
  }).join(' '),
))
const polygon = computed(() => axes.value.map(({ value }) => `${value.x},${value.y}`).join(' '))
</script>

<template>
  <figure
    aria-label="游戏评分，满分 10 分"
    class="not-prose mx-0 my-6"
  >
    <div relative mx-auto w-full max-w-340px class="aspect-[320/270]">
      <svg viewBox="0 0 320 270" class="pointer-events-none block size-full" aria-hidden="true">
        <g fill="none" class="stroke-zinc-300 dark:stroke-zinc-700" stroke-width="0.75">
          <polygon v-for="(ring, index) in grid" :key="index" :points="ring" />
          <line v-for="axis in axes" :key="axis.label" x1="160" y1="140" :x2="axis.end.x" :y2="axis.end.y" />
        </g>
        <polygon :points="polygon" class="fill-accent/15 stroke-accent" stroke-width="2" stroke-linejoin="round" />
        <circle
          v-for="axis in axes" :key="axis.label"
          :cx="axis.value.x" :cy="axis.value.y" r="3"
          class="fill-accent stroke-zinc-50 dark:stroke-zinc-900" stroke-width="1.5"
        />
      </svg>
      <ReviewScore
        v-for="axis in axes" :key="axis.label" :label="axis.label" :score="axis.score"
        class="absolute -translate-x-1/2 -translate-y-1/2"
        :style="{ left: `${axis.labelPosition.x / 320 * 100}%`, top: `${axis.labelPosition.y / 270 * 100}%` }"
      >
        {{ axis.comment }}
      </ReviewScore>
    </div>
  </figure>
</template>
