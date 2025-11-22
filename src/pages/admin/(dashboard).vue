<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { toArray } from '@vueuse/core'
import { withoutTrailingSlash } from 'ufo'
import { useAuth } from '~/composables/auth'

defineOptions({
  name: 'DashboardLayout',
})

const { user } = useAuth()
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  if (user.value?.role !== 'admin') {
    await router.push({
      path: '/admin/sign-in',
      query: {
        redirect: encodeURIComponent(route.fullPath),
      },
    })
  }
})

interface NavItem {
  title: string
  path: string
  icon: string
  match: string | string[]
}

const navItems: NavItem[] = [
  {
    title: '仪表盘',
    path: '/admin',
    icon: 'i-mingcute:dashboard-line',
    match: '/admin/(dashboard)',
  },
  {
    title: '文章管理',
    path: '/admin/posts',
    icon: 'i-mingcute:code-line',
    match: ['/admin/(dashboard)/posts/[[page]]', '/admin/(dashboard)/posts/[id]', '/admin/(dashboard)/posts/create'],
  },
]

function getRouteTitle(path: RouteLocationRaw) {
  const resolved = router.resolve(path)
  return resolved.meta.breadcrumb ?? resolved.path
}

const navigationItems = computed(() => {
  const paths = route.fullPath
    .replace('/admin', '')
    .split('/')
    .map(p => `/${p}`)

  let accumulated = '/admin'
  return paths.map((path) => {
    accumulated = withoutTrailingSlash(`${accumulated}${path}`)

    return {
      fullPath: accumulated,
      title: getRouteTitle(accumulated),
    }
  })
})
</script>

<template>
  <LayoutSidebarProvider
    :style="{
      '--spacing': '4px',
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 14)',
    }"
  >
    <LayoutSidebar>
      <!-- Sidebar Header -->
      <div flex="~ col gap-2" class="border-b border-border p-4">
        <div flex="~ items-center gap-2">
          <div class="i-mingcute:dashboard-2-line text-xl" />
          <h2 text-base font-semibold>
            管理后台
          </h2>
        </div>
        <div text-xs class="text-zinc-600 dark:text-zinc-400">
          {{ user?.name || user?.email }}
        </div>
      </div>

      <nav flex="~ col 1" class="overflow-y-auto p-2">
        <div flex="~ col gap-1">
          <RouterLink
            v-for="item in navItems" :key="item.path"
            :to="item.path"
            custom
          >
            <template #default="{ href, navigate }">
              <a
                :data-active="toArray(item.match).includes(withoutTrailingSlash($route.name))"
                bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50 data-[active=true]:zinc-200 data-[active=true]:dark:zinc-700 "
                flex="~ items-center gap-3"
                class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                exact-active-class="active"
                un-text="zinc-600 dark:zinc-400 data-[active=true]:zinc-900 data-[active=true]:dark:zinc-100"
                :href="href"
                @click="navigate"
              >
                <div :class="item.icon" class="shrink-0 text-base" />
                <span>{{ item.title }}</span>
              </a>
            </template>
          </RouterLink>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div flex="~ col gap-2" class="mt-auto border-t border-border p-4">
        <RouterLink
          to="/"
          flex="~ items-center gap-3"
          class="rounded-lg px-3 py-2 text-sm text-zinc-600 font-medium transition-colors hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:bg-zinc-700/50"
        >
          <div class="i-mingcute:home-1-line shrink-0 text-base" />
          <span>返回首页</span>
        </RouterLink>
      </div>
    </LayoutSidebar>
    <LayoutSidebarInset>
      <header
        border="b border"
        flex="~ shrink-0 items-center gap-2"
        class="h-$header-height transition-[width,height] ease-linear"
      >
        <div flex="~ items-center gap-1" class="w-full px-4 lg:gap-2 lg:px-6">
          <LayoutSidebarTrigger />
          <div
            role="separator"
            bg-border
            class="mx-2 h-4 w-px shrink-0"
          />

          <UiBreadcrumb>
            <UiBreadcrumbList>
              <template v-for="item in navigationItems" :key="item">
                <UiBreadcrumbItem :to="item.fullPath">
                  {{ item.title }}
                </UiBreadcrumbItem>
                <UiBreadcrumbSeparator class="last:hidden" />
              </template>
            </UiBreadcrumbList>
          </UiBreadcrumb>
        </div>
      </header>
      <div flex="~ col 1">
        <div flex="~ col 1 gap-2 " class="@container/main">
          <div flex="~ col gap-4" class="py-4 md:gap-6 md:py-6">
            <RouterView />
          </div>
        </div>
      </div>
    </LayoutSidebarInset>
  </LayoutSidebarProvider>
</template>
