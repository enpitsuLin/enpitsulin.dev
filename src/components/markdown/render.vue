<script setup lang="ts">
import type { Root } from 'hast'
import { useQuery } from '@pinia/colada'
import { Markdown } from './markdown'

defineOptions({
  name: 'MarkdownRender',
})

const { content = '', tag = 'div', queryKey = content } = defineProps<{
  content?: string
  tag?: string
  queryKey?: string
}>()

const hc = useHC()
const { data: root } = useQuery({
  key: () => ['highlight-markdown', queryKey],
  async query() {
    const res = await hc.api.markdown.$post({ json: { markdown: content } })
    const { rendered } = await res.json()
    return rendered as Root
  },
  enabled: !!content,
})
</script>

<template>
  <Markdown
    v-if="root"
    :tag
    :root="root"
    m-auto text-left prose prose-sm dark:prose-invert
  >
    {{ content }}
  </Markdown>
</template>
