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
import { unified } from 'unified'
import { VFile } from 'vfile'
import { getSingletonHighlighter } from '~~/lib/shiki'

async function getProcessor() {
  const highlighter = await getSingletonHighlighter({
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
