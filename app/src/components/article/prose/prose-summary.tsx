'use client'

import type { ExtraProps } from 'hast-util-to-jsx-runtime'
import type { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react'
import { Collapsible } from '@ark-ui/react'

export interface ProseSummaryProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, ExtraProps, PropsWithChildren {
}

export function ProseSummary({ children }: ProseSummaryProps) {
  return (
    <Collapsible.Trigger className="flex w-full items-center gap-2">
      <i className="i-[mingcute--right-fill] transition-transform group-data-[state=open]:rotate-90" />
      <span>
        {children}
      </span>
    </Collapsible.Trigger>
  )
}
