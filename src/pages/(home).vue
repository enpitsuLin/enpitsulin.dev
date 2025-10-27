<script setup lang="ts">
defineOptions({
  name: 'IndexPage',
})

const state = useState('test', () => 'foo')

// eslint-disable-next-line no-console
console.log(state.value)
</script>

<template>
  <HomeIntro />
  <button @click="state = 'bar'">
    Click me
  </button>
</template>
