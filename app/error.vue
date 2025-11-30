<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

const handleError = () => clearError({ redirect: '/' })
const isDev = import.meta.env.DEV
</script>

<template>
  <div flex="~ col items-center justify-center">
    <h2 pb-4 text-3xl>
      {{ error.statusCode }}
    </h2>
    <pre v-if="isDev" w-200 of-scroll text-sm>
        <code>
          {{ JSON.stringify(error, null, 2) }}
        </code>
      </pre>
    <UiButton @click="handleError">
      Clear errors
    </UiButton>
  </div>
</template>
