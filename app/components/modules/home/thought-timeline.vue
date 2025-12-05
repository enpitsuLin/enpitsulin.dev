<script setup lang="ts">
import type { SerializeObject } from 'nitropack/types'
import type { Thought } from '~~/shared/types/thought'

interface Props {
  thoughts: SerializeObject<Thought>[]
}

const { thoughts } = defineProps<Props>()

const groupedThoughts = computed(() => {
  const groups: Record<string, SerializeObject<Thought>[]> = {}

  thoughts.forEach((thought) => {
    const date = new Date(thought.publishedAt)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(thought)
  })

  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})
</script>

<template>
  <div flex="~ col gap-8">
    <div v-for="[dateKey, dateThoughts] in groupedThoughts" :key="dateKey">
      <h3 text="xl font-bold" mb-4>
        {{ useDateFormat(() => dateKey, 'MMM DD YYYY', { locales: 'zh-Hans' }) }}
      </h3>
      <div flex="~ col gap-6">
        <HomeThoughtItem
          v-for="thought in dateThoughts"
          :key="thought.id"
          :thought="thought"
        />
      </div>
    </div>
  </div>
</template>
