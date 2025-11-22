import rehypeShikiFromHighlighter from '@shikijs/rehype/core'
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import rehypeUnwrapImages from 'rehype-unwrap-images'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { createJavaScriptRegexEngine, makeSingletonHighlighter } from 'shiki'
import { createdBundledHighlighter } from 'shiki/core-unwasm.mjs'
import { unified } from 'unified'
import { VFile } from 'vfile'

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
    sh: () => import('@shikijs/langs/sh'),
  },
  engine: () => createJavaScriptRegexEngine(),
})

const getHighlighter = makeSingletonHighlighter(createHighlighter)

async function getProcessor() {
  const highlighter = await getHighlighter({
    themes: ['vitesse-light', 'vitesse-dark'],
    langs: ['tsx', 'typescript', 'javascript', 'json', 'html', 'css', 'markdown', 'yaml', 'sh'],
  })

  return unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkDirective)
    .use(remarkDirectiveRehype)
    .use(remarkEmoji)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(
      rehypeShikiFromHighlighter,
      highlighter,
      {
        themes: {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
        transformers: [
          {
            name: 'transformer:code-meta-properties',
            preprocess(code, options) {
              if (!options.meta) {
                return
              }
              const match = options.meta?.__raw?.match(/\[(.+)\]/)?.[1]
              if (match) {
                options.meta.filename = match
              }
              options.meta.code = code
              options.meta.language = options.lang
            },
          },
          transformerNotationDiff(),
          transformerNotationHighlight(),
          transformerNotationWordHighlight(),
          transformerNotationFocus(),
          transformerNotationErrorLevel(),
          transformerMetaHighlight(),
          transformerMetaWordHighlight(),
        ],
        defaultColor: false,
      },
    )
    .use(rehypeUnwrapImages)
    .use(rehypeStringify, { allowDangerousHtml: true })
}

export async function markdown(markdown: string) {
  const file = new VFile(markdown)
  const processor = await getProcessor()

  const mdast = processor.parse(file)

  return await processor.run(mdast, file)
}
