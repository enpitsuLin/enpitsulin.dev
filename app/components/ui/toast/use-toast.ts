import type { createToaster } from '@ark-ui/vue/toast'
import type { InjectionKey } from 'vue'

export const toastInjectionKey = Symbol('toast') as InjectionKey<ReturnType<typeof createToaster>>

export function useToast() {
  const toast = inject(toastInjectionKey)
  if (!toast) {
    throw new Error('Toast not found')
  }
  return toast
}
