'use client'

import { useClipboard } from '@ark-ui/react'

import { cn } from '@/lib/utils'

export function CopyCodeButton({ code }: { code: string }) {
  const { copy, copied } = useClipboard({ value: code })
  return (
    <button
      type="button"
      className="transition-property-[opacity,transform] absolute right-2 top-2 z-[1] flex items-center justify-center rounded-md bg-zinc-100 p-2 text-xs opacity-0 backdrop-blur duration-200 hover:scale-110 group-hover:opacity-100 dark:bg-zinc-900"
      aria-label="复制代码"
      onClick={() => {
        copy()
      }}
    >
      <div size-4 className={cn(copied ? 'i-mingcute:check-fill' : 'i-mingcute:copy-2-fill')} />
    </button>
  )
}
