'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'

export function ToTopButton() {
  const { scrollY } = useScroll()
  const [isVisible, setIsVisible] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsVisible(latest > 100)
  })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, height: `0` }}
          animate={{ opacity: 1, height: `2rem` }}
          exit={{ opacity: 0, height: `0` }}
          transition={{
            type: 'spring',
            duration: 0.2,
          }}
          type="button"
          flex="~ items-center justify-center"
          of-hidden
          className="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }}
        >
          <span className="sr-only">back to top</span>
          <i inline-block className="i-mingcute:up-line" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
