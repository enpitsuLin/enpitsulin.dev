import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    disabledAuth?: boolean
    breadcrumb?: string
    to?: string
    title?: string
    icon?: string
    hideInSidebar?: boolean
  }
}

export {}
