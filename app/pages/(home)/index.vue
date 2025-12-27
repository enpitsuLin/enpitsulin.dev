<script setup lang="ts">
defineOptions({
  name: 'IndexPage',
})

definePageMeta({
  layout: 'home',
})

defineRouteRules({ prerender: true })
</script>

<template>
  <HomeIntro />
  <HomeRecent />
  <HomeStackMarquee />
</template>
