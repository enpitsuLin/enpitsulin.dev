<script setup lang="ts">
import { codeBlockConfig } from '@milkdown/components/code-block'
import { Crepe } from '@milkdown/crepe'
import { highlight, highlightPluginConfig } from '@milkdown/plugin-highlight'
import { createParser } from '@milkdown/plugin-highlight/shiki'
import { Milkdown, useEditor } from '@milkdown/vue'
import { getSingletonHighlighter } from '~~/lib/shiki'

const { value } = defineProps<{ value: string }>()
const emit = defineEmits<{
  change: [value: string]
  blur: []
}>()

useEditor((root) => {
  const crepe = new Crepe({
    root,
    defaultValue: value,
    features: {
      latex: false,
    },
  })

  crepe.editor
    .config(async (ctx) => {
      const langs = ['tsx', 'typescript', 'javascript', 'json', 'html', 'css', 'markdown', 'yaml', 'sh']
      const highlighter = await getSingletonHighlighter({
        themes: ['vitesse-light', 'vitesse-dark'],
        langs,
      })
      const parser = createParser(highlighter)

      const { languages } = ctx.get(codeBlockConfig.key)

      const languagesToShikiLang = languages
        .map((lang) => {
          lang.alias.some((alias) => {
            if (langs.includes(alias)) {
              Reflect.set(lang, 'name', alias)
              Reflect.set(lang, 'shikiLang', alias)
              return true
            }
            return false
          })
          return (lang as typeof lang & { shikiLang?: string })
        })
        .filter(lang => !!lang.shikiLang)

      ctx.update(codeBlockConfig.key, defaultConfig => ({
        ...defaultConfig,
        languages: languagesToShikiLang,
        copyText: '复制代码',
        searchPlaceholder: '搜索语言',
      }))

      ctx.set(highlightPluginConfig.key, {
        parser,
      })
    })
    .use(highlight)

  crepe.on((manager) => {
    manager.blur(() => {
      emit('blur')
    })
    manager.markdownUpdated((ctx, markdown) => {
      emit('change', markdown)
    })
  })

  return crepe
})
</script>

<template>
  <Milkdown />
</template>
