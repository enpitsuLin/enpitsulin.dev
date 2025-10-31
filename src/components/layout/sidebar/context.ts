import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface SidebarContextProps {
  state: ComputedRef<'expanded' | 'collapsed'>
  open: Ref<boolean>
  openMobile: Ref<boolean>
  isMobile: Ref<boolean>
  toggleSidebar: () => void
}

export const SIDEBAR_CONTEXT_KEY = Symbol('sidebar-context') as InjectionKey<SidebarContextProps>

export function useSidebar() {
  const context = inject(SIDEBAR_CONTEXT_KEY)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}
