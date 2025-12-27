<script setup lang="ts">
import { LocaleProvider } from '@ark-ui/vue/locale'
import '@unocss/reset/tailwind.css'
import './styles/main.css'

const { title, description } = useAppConfig()

useHead({
  title,
  titleTemplate(t) {
    if (t !== title)
      return `${t} - ${title}`
    return `${t} - ${description}`
  },
  htmlAttrs: {
    lang: 'zh-Hans',
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
      type: 'image/svg+xml',
      href: '/favicon.svg',
    },
  ],
  bodyAttrs: {
    class: 'text-gray-950 dark:text-gray-50 bg-[#f4f4f5] dark:bg-[#121213] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#e5e7eb20_1px,transparent_1px)]',
  },
})
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtRouteAnnouncer />
  <LocaleProvider locale="zh-CN">
    <UiToastToaster>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UiToastToaster>
  </LocaleProvider>
</template>
