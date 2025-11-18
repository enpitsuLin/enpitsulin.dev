'use client'

import { ClientOnly } from '@ark-ui/react'
import { useTheme } from '@/hooks/theme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  function toggleDark() {
    toggle(theme === 'light' ? 'dark' : 'light')
  }
  function onClick() {
    if (!document.startViewTransition) {
      toggleDark()
      return
    }
    const viewTransition = document.startViewTransition(toggleDark)
    viewTransition.ready.then(() => {
      document.documentElement.classList.add('theme-toggle-animating')
    })
    viewTransition.finished.then(() => {
      document.documentElement.classList.remove('theme-toggle-animating')
    })
  }

  return (
    <button
      type="button"
      flex="~ items-center justify-center"
      of-hidden
      className="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
      onClick={onClick}
    >
      <span className="sr-only">change dark mode</span>
      <ClientOnly
        fallback={(<i inline-block className="i-mingcute:computer-line" />)}
      >
        {theme === 'dark' && <i inline-block className="i-mingcute:moon-line" />}
        {theme === 'light' && <i inline-block className="i-mingcute:sun-line" />}
        {theme === 'system' && <i inline-block className="i-mingcute:computer-line" />}
      </ClientOnly>
    </button>
  )
}
