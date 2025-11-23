<script setup lang="ts">
import { LocaleProvider } from '@ark-ui/vue/locale'
import { isDark } from '~/composables/dark'
import { description, title } from '~/constants'

useHead({
  title,
  titleTemplate(t) {
    if (t !== title)
      return `${t} - ${title}`
    return `${t} - ${description}`
  },
  htmlAttrs: {
    lang: 'zh-Hans',
    class: isDark ? 'dark' : '',
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
    class: 'text-gray-950 dark:text-gray-50 bg-slate-50 dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#e5e7eb20_1px,transparent_1px)]',
  },
})
</script>

<template>
  <LocaleProvider locale="zh-CN">
    <UiToastToaster>
      <Suspense>
        <RouterView />
        <template #fallback>
          <div>
            <h1>Loading...</h1>
          </div>
        </template>
      </Suspense>
    </UiToastToaster>
  </LocaleProvider>
</template>
