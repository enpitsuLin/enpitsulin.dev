'use client'

import { Tooltip as TooltipPrimitive } from '@ark-ui/react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.RootProvider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof TooltipPrimitive.Content> | null> }) {
  return (
    <TooltipPrimitive.Positioner>
      <TooltipPrimitive.Content
        ref={ref}
        bg="zinc-700 dark:zinc-300"
        text-background
        className={cn(
          'z-$z-index w-fit rounded-md px-2 py-1.5 text-balance text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  )
}
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
