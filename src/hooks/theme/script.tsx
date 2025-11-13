'use client'

import type { Theme } from '.'
import { useMemo } from 'react'

export function script(
  storageKey: string,
  defaultTheme: Theme,
) {
  const el = document.documentElement
  const systemThemes = ['light', 'dark']

  function updateDOM(theme: string) {
    el.classList.remove('dark', 'light')
    el.classList.add(theme)

    setColorScheme(theme)
  }

  function setColorScheme(theme: string) {
    if (systemThemes.includes(theme)) {
      el.style.colorScheme = theme
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  try {
    const themeName = localStorage.getItem(storageKey) || defaultTheme
    const isSystem = themeName === 'system'
    const theme = isSystem ? getSystemTheme() : themeName
    updateDOM(theme)
  }
  catch {
    //
  }
}

export function ThemeScript() {
  const scriptContext = useMemo(() => `(${script.toString()})(${JSON.stringify(['theme', 'system']).slice(1, -1)})`, [])
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: scriptContext }}
    />
  )
}
