<script setup lang="ts">
defineOptions({
  name: 'BlogPage',
})

const route = useRoute('/(home)/blog/[slug]')
</script>

<template>
  <h1>Blog {{ route.params.slug }}</h1>
</template>
