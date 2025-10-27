import type { Application } from '~/types'
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'default' | 'dashboard' | false
    requireAuth?: boolean
  }
}

declare module 'vue' {
  interface App<HostElement> {
    $eApp: Application
  }
}

export {}
