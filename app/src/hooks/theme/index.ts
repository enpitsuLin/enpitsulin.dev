'use client'

import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const themeStore = {
  listeners: new Set<() => void>(),
  getSnapshot() {
    return localStorage.getItem('theme') ?? 'system'
  },
  getServerSnapshot() {
    return 'system'
  },
  subscribe(callback: () => void) {
    themeStore.listeners.add(callback)
    window.addEventListener('storage', callback)
    return () => {
      themeStore.listeners.delete(callback)
      window.removeEventListener('storage', callback)
    }
  },
  toggle(theme: Theme) {
    localStorage.setItem('theme', theme)
    themeStore.listeners.forEach(listener => listener())
  },
}

const prefersThemeStore = {
  getSnapshot() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  },
  getServerSnapshot() {
    return 'light'
  },
  subscribe(callback: () => void) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', callback)
    return () => {
      mediaQuery.removeEventListener('change', callback)
    }
  },
}

export interface UseThemeReturn {
  theme: Theme
  prefersTheme: Exclude<Theme, 'system'>
  toggle: (theme: Theme) => void
}

export function useTheme() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  )

  const prefersTheme = useSyncExternalStore(
    prefersThemeStore.subscribe,
    prefersThemeStore.getSnapshot,
    prefersThemeStore.getServerSnapshot,
  )

  function toggle(theme: Theme) {
    themeStore.toggle(theme)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
  }

  return {
    theme,
    prefersTheme,
    toggle,
  }
}
