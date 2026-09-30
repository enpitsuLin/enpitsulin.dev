import type { InjectionKey } from 'vue'

interface MasonryContext {
  registerItem: (item: HTMLElement, content: HTMLElement) => () => void
}

export const masonryContextKey: InjectionKey<MasonryContext> = Symbol('Masonry')
