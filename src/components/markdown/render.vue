<script setup lang="ts">
defineOptions({
  name: 'MarkdownRender',
})

const { content = '', tag = 'div' } = defineProps<{
  content?: string
  tag?: string
}>()
</script>

<template>
  <tag
    m-auto text-left prose prose-sm dark:prose-invert
  >
    {{ content }}
  </tag>
</template>
