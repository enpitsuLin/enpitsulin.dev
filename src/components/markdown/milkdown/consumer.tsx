import { codeBlockConfig } from '@milkdown/components/code-block'
import { Crepe } from '@milkdown/crepe'
import { highlight, highlightPluginConfig } from '@milkdown/plugin-highlight'
import { createParser } from '@milkdown/plugin-highlight/shiki'
import { Milkdown, useEditor } from '@milkdown/vue'
import { getSingletonHighlighter } from '~~/lib/shiki'
import { directivePlugin } from './plugins'

export interface MarkdownConsumerProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
}

export const MarkdownConsumer = defineComponent<MarkdownConsumerProps>(
  (props, { attrs }) => {
    useEditor((root) => {
      const crepe = new Crepe({
        root,
        defaultValue: props.value,
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
        .use(directivePlugin)

      crepe.on((manager) => {
        manager.blur(() => {
          props.onBlur()
        })
        manager.markdownUpdated((ctx, markdown) => {
          props.onChange(markdown)
        })
      })

      return crepe
    })
    return () => (<Milkdown {...attrs} />)
  },
  {
    props: ['value', 'onChange', 'onBlur'],
  },
)
