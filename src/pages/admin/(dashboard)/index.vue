<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})

definePage({
  meta: {
    breadcrumb: '仪表盘',
  },
})

const { user } = useAuth()
</script>

<template>
  <div class="px-4 lg:px-6">
    <div
      flex="~ col gap-6"
      border="~ border rounded-xl"
      class="p-6 shadow @container/card"
    >
      <h1>Dashboard</h1>
      <div flex="~ col gap-2">
        {{ user }}
      </div>
    </div>
  </div>
</template>
