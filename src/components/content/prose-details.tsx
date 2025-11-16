'use client'

import type { ExtraProps } from 'hast-util-to-jsx-runtime'
import type { DetailedHTMLProps, DetailsHTMLAttributes } from 'react'
import { Collapsible } from '@ark-ui/react'
import { Children, isValidElement } from 'react'

import { ProseSummary } from './prose-summary'

export interface ProseDetailsProps
  extends DetailedHTMLProps<DetailsHTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement>, ExtraProps {
}

export function ProseDetails({ children }: ProseDetailsProps) {
  const childrenArray = Children.toArray(children)
  const content = new Set(childrenArray.filter((child) => {
    if (isValidElement(child)) {
      return child.type !== ProseSummary
    }
    return true
  }))
  const trigger = childrenArray.filter(child => !content.has(child))
  return (
    <Collapsible.Root className="group my-4 overflow-hidden rounded-md bg-[var(--tw-prose-quote-borders)] p-4">
      {trigger}
      <Collapsible.Content className="not-prose pt-2 data-[state=closed]:animate-collapsible-slide-up data-[state=open]:animate-collapsible-slide-down">
        {content}
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
