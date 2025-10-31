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
      Dashboard
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
