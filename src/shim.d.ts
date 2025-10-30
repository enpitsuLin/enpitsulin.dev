import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'default' | 'dashboard' | false
    requireAuth?: boolean | 'user' | 'admin'
  }
}

export {}
