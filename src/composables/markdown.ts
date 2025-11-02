import type { Props } from 'hast-util-to-jsx-runtime'
import type { Component, SlotsType } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
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
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
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
import { Comment, Fragment, h, isVNode, Static, Suspense, Text, withCtx } from 'vue'
import { useZootApp } from '~~/lib/app'

function isVNodeTypesComponent(type: any): type is Component {
  if (typeof type === 'string') {
    return false
  }
  if (isVNode(type)) {
    return false
  }
  if (type === Text || type === Static || type === Comment || type === Fragment) {
    return false
  }
  return true
}

function jsx(type: any, props: Props, key?: string | undefined) {
  const { children } = props
  delete props.children
  if (arguments.length > 2) {
    props.key = key
  }
  // use default slot to prevent "Non-function value encountered for default slot"
  if (isVNodeTypesComponent(type)) {
    return h(type, props, { default: withCtx(() => children) })
  }
  return h(
    type,
    props,
    children,
  ) as JSX.Element
}

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

const componentsGlob = import.meta.glob<any>(
  '~/components/markdown/content/*.vue',
  { eager: true, import: 'default' },
)

function wrapperMarkdownComponent(component: Component) {
  return defineComponent({
    name: 'MarkdownComponent',
    props: {
      node: {
        type: Object,
        required: true,
      },
    },
    slots: Object as SlotsType<{
      default: () => VNode[]
    }>,
    setup({ node }, { attrs, slots }) {
      provide('node', node)
      return () => h(component, attrs, slots)
    },
  })
}

const components = Object.fromEntries(
  Object.entries(componentsGlob).map(([key, component]) => [
    key.replace(/^\/src\/components\/markdown\/content\/(.*)\.vue$/, '$1'),
    wrapperMarkdownComponent(component),
  ]),
)

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

export function useMarkdown(markdown: string) {
  const Renderer = defineComponent({
    name: 'Renderer',
    async setup() {
      const file = new VFile(markdown)
      const processor = await getProcessor()

      const mdast = processor.parse(file)

      const hast = await processor.run(mdast, file)

      const nodes = toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs: jsx,
        passNode: true,
        elementAttributeNameCase: 'html',
        ignoreInvalidStyle: true,
        components,
      })

      return () => h(nodes)
    },
  })

  const Content = defineComponent({
    name: 'Content',
    props: {
      tag: {
        type: String,
        default: 'div',
      },
    },
    setup({ tag }, ctx) {
      const zoot = useZootApp()
      return () => h(
        Suspense,
        {
          suspensible: true,
          onResolve() {
            zoot.callHook('app:suspense:resolve')
          },
        },
        {
          default: () => h(tag, ctx.attrs, h(Renderer)),
          fallback: () => h('div', 'Loading...'),
        },
      )
    },
  })

  return { Renderer, Content }
}
