<script setup lang="ts">
defineOptions({
  name: 'PostPage',
})
const route = useRoute('/(admin)/dashboard/posts/[id]')
</script>

<template>
  <h1>Post {{ route.params.id }}</h1>
</template>
