import type { createToaster } from '@ark-ui/vue/toast'
import type { InjectionKey, VNodeChild } from 'vue'

export const toastInjectionKey = Symbol('toast') as InjectionKey<ReturnType<typeof createToaster<VNodeChild>>>

export function useToast() {
  const toast = inject(toastInjectionKey)
  if (!toast) {
    throw new Error('Toast not found')
  }
  return toast
}
