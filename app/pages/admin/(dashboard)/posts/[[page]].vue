<script setup lang="ts">
defineOptions({
  name: 'PostsPage',
})

definePageMeta({
  validate: (route) => {
    if (typeof route.params.page === 'undefined')
      return true
    return !Number.isNaN(Number(route.params.page))
  },
  breadcrumb: '文章管理',
})
</script>

<template>
  <div>
    <h1>文章管理</h1>
    <div>{{ $route.params.page }}</div>
  </div>
</template>
