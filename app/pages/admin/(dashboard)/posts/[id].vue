<script setup lang="ts">
defineOptions({
  name: 'PostPage',
})

const route = useRoute('admin-posts-id')
</script>

<template>
  <div>
    <h1>编辑文章</h1>
    <div>ID: {{ route.params.id }}</div>
  </div>
</template>
