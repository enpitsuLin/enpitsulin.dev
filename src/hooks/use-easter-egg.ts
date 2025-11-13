'use client'

import { useEffect, useRef, useState } from 'react'

const inputQueue = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

/**
 * Custom hook to detect Konami Code input
 * Returns true when the correct sequence is entered
 */
export function useEasterEgg(): boolean {
  const [isActivated, setIsActivated] = useState(false)
  const currentIndex = useRef(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === inputQueue[currentIndex.current]) {
        currentIndex.current++
        if (currentIndex.current === inputQueue.length) {
          setIsActivated(true)
          setTimeout(() => {
            setIsActivated(false)
            currentIndex.current = 0
          }, 1000)
        }
      }
      else {
        currentIndex.current = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return isActivated
}
