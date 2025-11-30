<script setup lang="ts">
defineOptions({
  name: 'PostsPage',
})

const route = useRoute('admin-posts-page')
</script>

<template>
  <div>
    <h1>文章管理</h1>
    <div>第 {{ route.params.page || 0 }} 页</div>
  </div>
</template>
