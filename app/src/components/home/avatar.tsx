'use client'

import { motion } from 'motion/react'
import { useEasterEgg } from '@/hooks/use-easter-egg'
import { cn } from '@/lib/utils'

export function IntroAvatar({ className }: { className?: string }) {
  const easterEgg = useEasterEgg()
  return (
    <div relative className={className}>
      <div className={cn(easterEgg && 'animate-spin')}>
        <motion.img
          layoutId="avatar"
          alt="avatar"
          width="250"
          height="250"
          decoding="async"
          className="border-[0.35rem] border-white rounded-full object-cover shadow-xl"
          src="https://avatars.githubusercontent.com/enpitsuLin"
        />
      </div>
      <span
        absolute
        bottom-0
        right-0
        cursor-default
        text-4xl
        className="transition-transform hover:animate-name-wave-hand hover:animate-duration-1000 hover:animate-iteration-infinite"
      >
        👋
      </span>
    </div>
  )
}
