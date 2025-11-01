<script setup lang="ts">
import {
  DialogBackdrop,
  DialogContent,
  DialogPositioner,
  DialogRoot,
} from '@ark-ui/vue/dialog'
import { SIDEBAR_WIDTH_MOBILE } from './constant'
import { useSidebar } from './context'

interface Props {
  class?: string
  collapsible?: 'offcanvas' | 'icon' | 'none'
}

const {
  collapsible = 'offcanvas',
  class: className,
} = defineProps<Props>()

const { isMobile, state, openMobile } = useSidebar()
</script>

<template>
  <template v-if="collapsible === 'none'">
    <div
      data-slot="sidebar"
      flex="~ col"
      class="h-full w-$sidebar-width bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      :class="className"
    >
      <slot />
    </div>
  </template>
  <template v-else-if="isMobile">
    <DialogRoot v-model:open="openMobile">
      <Teleport to="#teleports">
        <DialogBackdrop
          fixed inset-0 z-50
          bg-black:50
          class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        />
        <DialogPositioner>
          <DialogContent
            data-slot="sidebar"
            data-mobile="true"
            border="r border"
            flex="not-[[hidden]]:~ col gap-4"
            bg="white/50 dark:zinc-900/50" fixed p-0
            class="inset-y-0 left-0 z-50 h-full w-$sidebar-width w-3/4 shadow-lg transition ease-in-out sm:max-w-sm data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left"
            backdrop-blur
            :style="{
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            }"
          >
            <div flex="~ col" size-full>
              <slot />
            </div>
          </DialogContent>
        </DialogPositioner>
      </Teleport>
    </DialogRoot>
  </template>
  <template v-else>
    <div
      class="group peer hidden md:block"
      :data-state="state"
      :data-collapsible="state === 'collapsed' ? collapsible : ''"
      data-side="left"
      data-variant="inset"
      data-slot="sidebar"
    >
      <div
        relative
        data-slog="sidebar-gap"
        class="w-$sidebar-width bg-transparent transition-width duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0"
      />
      <div
        data-slot="sidebar-container"
        fixed inset-y-0 left-0 z-10
        flex="md:~" p-2
        class="hidden w-$sidebar-width transition-[left,right,width] duration-200 ease-linear h-svh group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          flex="~ col"
          size-full
        >
          <slot />
        </div>
      </div>
    </div>
  </template>
</template>
