import { createdBundledHighlighter, makeSingletonHighlighter } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

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

export const getSingletonHighlighter = makeSingletonHighlighter(createHighlighter)
