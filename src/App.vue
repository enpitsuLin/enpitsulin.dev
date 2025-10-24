<script setup lang="ts">
import { PWAManifest } from './modules/pwa'

useHead({
  title: 'enpitsulin.dev',
  meta: [
    {
      name: 'description',
      content: 'enpitsulin.dev',
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
