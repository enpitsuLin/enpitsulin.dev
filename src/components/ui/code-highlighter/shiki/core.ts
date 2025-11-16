import type { BundledHighlighterOptions, HighlighterGeneric } from 'shiki/core'
import type { Theme } from '@/hooks/theme'
import { createHighlighterCore, makeSingletonHighlighter } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import bash from 'shiki/langs/bash.mjs'
import javascript from 'shiki/langs/javascript.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import typescript from 'shiki/langs/typescript.mjs'

import githubDark from 'shiki/themes/github-dark.mjs'
import githubLight from 'shiki/themes/github-light.mjs'

const jsEngine = createJavaScriptRegexEngine()

export interface CodeHighlighterOption {
  lang: string
  attrs: string
  code: string
}

type Lang = 'javascript' | 'tsx' | 'typescript' | 'bash'
type Themes = 'github-dark' | 'github-light'

export async function getHighlighter(
  options?: Partial<BundledHighlighterOptions<Lang, Themes>>,
) {
  const getHighlighter = makeSingletonHighlighter (() => {
    return createHighlighterCore({
      engine: jsEngine,
      langs: [bash, typescript, tsx, javascript],
      themes: [githubDark, githubLight],
    }) as Promise<HighlighterGeneric<Lang, Theme>>
  })

  return getHighlighter(options)
}
