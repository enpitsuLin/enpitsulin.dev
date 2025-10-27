import type { Application } from '~/types'
import { hasInjectionContext } from 'vue'

export function useApp() {
  let AppInstance
  if (hasInjectionContext()) {
    AppInstance = getCurrentInstance()?.appContext.app.$eApp
  }

  if (!AppInstance) {
    throw new Error('Application instance unavailable')
  }

  return AppInstance as Application
}
