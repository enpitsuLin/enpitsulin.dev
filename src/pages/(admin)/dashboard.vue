<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})

const { user } = useAuth()
</script>

<template>
  <h1>Dashboard</h1>
  <div flex="~ col gap-2">
    {{ user }}
  </div>
</template>
