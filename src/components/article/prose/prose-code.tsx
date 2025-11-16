import type { ExtraProps } from 'hast-util-to-jsx-runtime'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

import { CopyCodeButton } from './copy-code-button'

export interface ProsePreProps extends DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>, ExtraProps {
  filename?: string
  language?: string
  code?: string
}

export function ProsePre({
  children,
  filename,
  language,
  code,
  className,
}: ProsePreProps) {
  const languageLength = (language?.length ?? 0)

  function getBaseLog(y: number) {
    return Math.log(y) / Math.log(1.75)
  }

  const mr = Math.ceil((getBaseLog(languageLength) + 1) * 16) + 4
  return (
    <div className="group relative my-6 overflow-hidden rounded-md text-[13px]">
      {filename && language && (
        <div className="z-10 flex w-full items-center justify-between rounded-t-xl bg-[#d4d4d8] bg-opacity-20 px-5 py-2 text-sm">
          <span className="shrink-0 grow truncate">{filename}</span>
          <span className="pointer-events-none shrink-0 grow-0 uppercase" aria-hidden="true">
            {language}
          </span>
        </div>
      )}
      {!filename && language && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 z-10 text-xs uppercase opacity-30"
        >
          {language}
        </div>
      )}
      <div className="relative bg-zinc-200 dark:bg-zinc-800">
        {code && <CopyCodeButton code={code} />}
        <div
          style={language && !filename
            ? {
                // @ts-expect-error: no css variables type
                '--pre-language-margin': `${mr}px`,
                '--mr': `${languageLength * 14 + 4}px`,
              }
            : undefined}
          className={cn(className, 'not-prose relative overflow-hidden')}
        >
          <pre className="scroll-track-mr my-[1em] max-h-[400px] overflow-auto px-4 pb-2">
            {children}
          </pre>
        </div>
      </div>
    </div>
  )
}
