<script setup lang="ts">
import { fromHighlighter } from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import LinkAttributes from 'markdown-it-link-attributes'
import { createJavaScriptRegexEngine } from 'shiki'
import { createdBundledHighlighter } from 'shiki/core-unwasm.mjs'

defineOptions({
  name: 'MarkdownRender',
})

const { content } = defineProps<{
  content: string
}>()

const createHighlighter = createdBundledHighlighter({
  themes: {
    'vitesse-light': () => import('@shikijs/themes/vitesse-light'),
    'vitesse-dark': () => import('@shikijs/themes/vitesse-dark'),
  },
  langs: {
    tsx: () => import('@shikijs/langs/tsx'),
    typescript: () => import('@shikijs/langs/typescript'),
    javascript: () => import('@shikijs/langs/javascript'),
    json: () => import('@shikijs/langs/json'),
    html: () => import('@shikijs/langs/html'),
    css: () => import('@shikijs/langs/css'),
    markdown: () => import('@shikijs/langs/markdown'),
    yaml: () => import('@shikijs/langs/yaml'),
  },
  engine: () => createJavaScriptRegexEngine(),
})

const highlighter = await createHighlighter({
  themes: ['vitesse-light', 'vitesse-dark'],
  langs: ['tsx', 'typescript', 'javascript', 'json', 'html', 'css', 'markdown', 'yaml'],
})

const shiki = fromHighlighter(highlighter, {
  defaultColor: false,
  themes: {
    light: 'vitesse-light',
    dark: 'vitesse-dark',
  },
})

const md = new MarkdownIt()
md.use(LinkAttributes, {
  matcher: (link: string) => /^https?:\/\//.test(link),
  attrs: {
    target: '_blank',
    rel: 'noopener',
  },
})
md.use(shiki)

const html = md.render(content)
</script>

<template>
  <div class="m-auto text-left prose prose-sm dark:prose-invert" v-html="html" />
</template>
