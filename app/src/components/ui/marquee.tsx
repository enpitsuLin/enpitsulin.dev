'use client'

import { cn } from '@/lib/utils'

interface MarqueeProps extends React.PropsWithChildren {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  vertical?: boolean
  repeat?: number
}

export function Marquee({
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  children,
}: MarqueeProps) {
  return (
    <div
      flex="~"
      of-hidden
      p-2
      className={cn(
        'group [--duration:40s] [--gap:1rem] gap-$gap',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          flex="~ justify-around gap-$gap shrink-0"
          className={cn({
            'animate-marquee flex-row': !vertical,
            'animate-marquee-vertical flex-col': vertical,
            'group-hover:[animation-play-state:paused]': pauseOnHover,
            'animate-reverse!': reverse,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
