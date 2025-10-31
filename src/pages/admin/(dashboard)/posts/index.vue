<script setup lang="ts">
defineOptions({
  name: 'PostsPage',
})
</script>

<template>
  <h1>Posts</h1>
  <MarkdownRender
    content="
  # Hello, world!

- This is a list item
- This is another list item

```javascript
const a = 1
```
"
  />
</template>
