<script setup lang="ts">
import { useAuth } from '~/composables/auth'

defineOptions({
  name: 'DashboardLayout',
})

const { user } = useAuth()
const router = useRouter()
const route = useRoute()

if (user.value?.role !== 'admin') {
  await router.push({
    path: '/admin/sign-in',
    query: {
      redirect: encodeURIComponent(route.fullPath),
    },
  })
}

interface NavItem {
  title: string
  path: string
  icon: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: 'i-mingcute:dashboard-line',
  },
  {
    title: '文章管理',
    path: '/admin/posts',
    icon: 'i-mingcute:document-line',
    children: [
      {
        title: '文章列表',
        path: '/admin/posts',
        icon: 'i-mingcute:list-check-line',
      },
      {
        title: '新建文章',
        path: '/admin/posts/new',
        icon: 'i-mingcute:add-circle-line',
      },
    ],
  },
]

// Check if a path is active
function isActive(path: string) {
  if (path === '/admin') {
    return route.path === path
  }
  return route.path.startsWith(path)
}
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

      <!-- Navigation Menu -->
      <nav flex="~ col 1" class="overflow-y-auto p-2">
        <div flex="~ col gap-1">
          <template v-for="item in navItems" :key="item.path">
            <!-- Parent Item -->
            <RouterLink
              :to="item.path"
              flex="~ items-center gap-3"
              class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
              :class="{
                'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100': isActive(item.path),
                'text-zinc-600 dark:text-zinc-400': !isActive(item.path),
              }"
            >
              <div :class="item.icon" class="shrink-0 text-base" />
              <span>{{ item.title }}</span>
            </RouterLink>

            <!-- Children Items -->
            <div v-if="item.children?.length" flex="~ col gap-1" class="mb-1 ml-4 mt-1">
              <RouterLink
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                flex="~ items-center gap-3"
                class="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                :class="{
                  'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100': route.path === child.path,
                  'text-zinc-600 dark:text-zinc-400': route.path !== child.path,
                }"
              >
                <div :class="child.icon" class="shrink-0 text-base" />
                <span>{{ child.title }}</span>
              </RouterLink>
            </div>
          </template>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div flex="~ col gap-2" class="mt-auto border-t border-border p-4">
        <RouterLink
          to="/"
          flex="~ items-center gap-3"
          class="rounded-lg px-3 py-2 text-sm text-zinc-600 font-medium transition-colors hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:bg-zinc-700/50"
        >
          <div class="i-mingcute:home-line shrink-0 text-base" />
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
