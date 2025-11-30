<script setup lang="ts">
defineOptions({
  name: 'PostsPage',
})

const route = useRoute('admin-posts-page')
</script>

<template>
  <div>
    <h1>文章管理</h1>
    <div>{{ route.params.page }}</div>
  </div>
</template>
