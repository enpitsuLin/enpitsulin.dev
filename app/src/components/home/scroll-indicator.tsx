'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function IntroScrollIndicator() {
  const { scrollY } = useScroll()
  const [hide, setHide] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setHide(y > 20)
  })
  return (
    <div
      className={cn(
        'mt-auto hidden pb-6 pt-8 transition-opacity duration-500 sm:flex sm:justify-center',
        hide ? 'opacity-0' : 'opacity-100',
      )}
    >
      <span className="animate-bounce text-gray-500">
        <i className="i-mingcute:right-line inline-block rotate-90" />
      </span>
    </div>
  )
}
