import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    disabledAuth?: boolean
    breadcrumb?: string
  }
}

export {}
