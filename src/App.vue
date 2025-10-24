<script setup lang="ts">
import { description, title } from '~/constants'
import { PWAManifest } from './modules/pwa'

useHead({
  title,
  titleTemplate(t) {
    if (t !== title)
      return `${t} - ${title}`
    return `${t} - ${description}`
  },
  htmlAttrs: {
    lang: 'zh-cmn-Hans',
  },
  meta: [
    {
      name: 'description',
      content: description,
    },
    {
      name: 'theme-color',
      media: '(prefers-color-scheme: dark)',
      content: '#00aba9',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ],
  link: [
    {
      rel: 'icon',
      media: '(prefers-color-scheme: dark)',
      href: '/favicon-dark.svg',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg',
    },
  ],
  bodyAttrs: {
    class: 'font-sans',
  },
})
</script>

<template>
  <PWAManifest />
  <RouterView />
</template>
