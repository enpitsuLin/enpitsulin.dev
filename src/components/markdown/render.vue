<script setup lang="ts">
defineOptions({
  name: 'MarkdownRender',
})

const { content = '', tag = 'div' } = defineProps<{
  content?: string
  tag?: string
}>()

const { Content } = useMarkdown(content)
</script>

<template>
  <Content
    :tag
    m-auto text-left prose prose-sm dark:prose-invert
  />
</template>
