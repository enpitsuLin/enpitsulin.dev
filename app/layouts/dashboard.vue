<script setup lang="ts">
import { Collapsible } from '@ark-ui/vue'

defineOptions({
  name: 'DashboardLayout',
})

const { adminNavigation } = useAppConfig()
</script>

<template>
  <UiSidebarProvider
    :style="{
      '--spacing': '4px',
      '--sidebar-width': 'calc(var(--spacing) * 72)',
      '--header-height': 'calc(var(--spacing) * 14)',
    }"
  >
    <UiSidebar>
      <!-- Sidebar Header -->
      <div flex="~ col gap-2" class="border-b border-border p-4">
        <div flex="~ items-center gap-2">
          <div class="i-mingcute:dashboard-2-line text-xl" />
          <h2 text-base font-semibold>
            管理后台
          </h2>
        </div>
        <div text-xs class="text-zinc-600 dark:text-zinc-400">
          Username
        </div>
      </div>

      <nav flex="~ col 1" class="overflow-y-auto p-2">
        <div flex="~ col gap-1">
          <template v-for="item in adminNavigation" :key="item.href">
            <template v-if="item.children">
              <Collapsible.Root default-open>
                <Collapsible.Trigger
                  w-full
                  :data-active="item.match.some(match => $route.name === match)"
                  bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50 data-[active=true]:zinc-200 data-[active=true]:dark:zinc-700 "
                  flex="~ items-center gap-3"
                  class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  un-text="zinc-600 dark:zinc-400 data-[active=true]:zinc-900 data-[active=true]:dark:zinc-100"
                >
                  <div :class="item.icon" class="shrink-0 text-base" />
                  <span>{{ item.label }}</span>
                  <Collapsible.Indicator
                    ml-auto
                    class="transition-transform duration-200 data-[state=open]:rotate-180"
                  >
                    <div class="i-mingcute:down-line size-4" />
                  </Collapsible.Indicator>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <div flex="~ col gap-1" pl-6 py-2 relative>
                    <div absolute left-3 top-1 bottom-1 w-px bg-border />
                    <template v-for="child in item.children" :key="child.href">
                      <NuxtLink
                        :to="child.href"
                        custom
                      >
                        <template #default="{ href, navigate, isExactActive }">
                          <a
                            :data-active="isExactActive"
                            bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50 data-[active=true]:zinc-200 data-[active=true]:dark:zinc-700 "
                            flex="~ items-center gap-3"
                            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                            un-text="zinc-600 dark:zinc-400 data-[active=true]:zinc-900 data-[active=true]:dark:zinc-100"
                            :href="href"
                            @click="navigate"
                          >
                            <div :class="child.icon" class="shrink-0 text-base" />
                            <span>{{ child.label }}</span>
                          </a>
                        </template>
                      </NuxtLink>
                    </template>
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>
            </template>
            <template v-else>
              <NuxtLink
                :key="item.href"
                :to="item.href"
                custom
              >
                <template #default="{ href, navigate, isExactActive }">
                  <a
                    :data-active="isExactActive"
                    bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50 data-[active=true]:zinc-200 data-[active=true]:dark:zinc-700 "
                    flex="~ items-center gap-3"
                    class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    un-text="zinc-600 dark:zinc-400 data-[active=true]:zinc-900 data-[active=true]:dark:zinc-100"
                    :href="href"
                    @click="navigate"
                  >
                    <div :class="item.icon" class="shrink-0 text-base" />
                    <span>{{ item.label }}</span>
                  </a>
                </template>
              </NuxtLink>
            </template>
          </template>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div flex="~ col gap-2" class="mt-auto border-t border-border p-4">
        <NuxtLink
          to="/"
          flex="~ items-center gap-3"
          class="rounded-lg px-3 py-2 text-sm text-zinc-600 font-medium transition-colors hover:bg-zinc-200/50 dark:text-zinc-400 dark:hover:bg-zinc-700/50"
        >
          <div class="i-mingcute:home-1-line shrink-0 text-base" />
          <span>返回首页</span>
        </NuxtLink>
      </div>
    </UiSidebar>
    <UiSidebarInset of-hidden class="max-h-[calc(100svh-24px)]">
      <header
        border="b border"
        flex="~ shrink-0 items-center gap-2"
        class="h-$header-height transition-[width,height] ease-linear"
      >
        <div flex="~ items-center gap-1" class="w-full px-4 lg:gap-2 lg:px-6">
          <UiSidebarTrigger />
          <div
            role="separator"
            bg-border
            class="mx-2 h-4 w-px shrink-0"
          />

          <UiBreadcrumb>
            <UiBreadcrumbList>
              <template v-for="item in $route.matched" :key="item">
                <UiBreadcrumbItem :to="item.path">
                  {{ item.meta?.breadcrumb }}
                </UiBreadcrumbItem>
                <UiBreadcrumbSeparator class="last:hidden" />
              </template>
            </UiBreadcrumbList>
          </UiBreadcrumb>
        </div>
      </header>
      <div
        of-auto space-y-2
        class="h-[calc(100%-var(--header-height))] py-4 @container/main md:gap-6 md:py-6"
      >
        <slot />
      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>
