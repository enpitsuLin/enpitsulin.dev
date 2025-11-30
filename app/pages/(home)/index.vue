<script setup lang="ts">
defineOptions({
  name: 'IndexPage',
})

definePageMeta({
  layout: 'home',
})
</script>

<template>
  <HomeIntro />
  <HomeRecent />
  <HomeStackMarquee />
</template>
