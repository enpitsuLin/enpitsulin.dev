'use client'

import { useMemo, useSyncExternalStore } from 'react'

function makeMediaQueryStore(query: string, serverSnapshot: boolean = false) {
  const mediaQueryStore = {
    listeners: new Set<() => void>(),
    getSnapshot() {
      const matchMedia = window.matchMedia(query)
      return matchMedia.matches
    },
    getServerSnapshot() {
      return serverSnapshot
    },
    subscribe(callback: () => void) {
      const matchMedia = window.matchMedia(query)
      matchMedia.addEventListener('change', callback)

      mediaQueryStore.listeners.add(callback)
      return () => {
        matchMedia.removeEventListener('change', callback)

        mediaQueryStore.listeners.delete(callback)
      }
    },
  }

  return mediaQueryStore
}

/**
 * Custom hook to subscribe to media query changes using useSyncExternalStore
 * @param query - The media query string to match (e.g., '(min-width: 768px)')
 * @returns boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string, serverSnapshot: boolean = false): boolean {
  const mediaQueryStore = useMemo(() => makeMediaQueryStore(query, serverSnapshot), [query, serverSnapshot])

  return useSyncExternalStore(
    mediaQueryStore.subscribe,
    mediaQueryStore.getSnapshot,
    mediaQueryStore.getServerSnapshot,
  )
}
