<script setup lang="ts">
import type { MenuSelectionDetails } from '@ark-ui/vue'
import {
  MenuContent,
  MenuIndicator,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
} from '@ark-ui/vue'
import { navigation } from '~/constants'

const router = useRouter()

function onSelect(details: MenuSelectionDetails) {
  router.push(details.value)
}
</script>

<template>
  <div
    relative ml-auto
    class="transform animate-duration-1300 animate-ease-$spring-easing animate-in slide-in-from-top-70px md:hidden"
  >
    <MenuRoot @select="onSelect">
      <MenuTrigger
        bg="zinc-50/50 dark:zinc-950/50"
        px-4 py="2"
        flex="inline items-center gap-1"
        border="~ border rounded-full" outline-none
        class="shadow-black/10 shadow-md backdrop-blur-0.5rem transition-background-color"
      >
        前往
        <MenuIndicator class="i-mingcute:arrows-right-line" />
      </MenuTrigger>
      <MenuPositioner
        bg="zinc-50/50 dark:zinc-950/50"
        border="~ border rounded-lg"
        class="w-[calc(100%+6rem)] shadow-black/10 shadow-md backdrop-blur-0.5rem transition-background-color"
      >
        <MenuContent flex="~ col gap-1" p-2 outline-none>
          <header p-2 text-sm op-60>
            站内导航
          </header>

          <MenuItem
            v-for="{ href, label } in navigation"
            :key="href"
            :value="href"
            flex="~ items-center"
            relative h-8 px-2
            class="not-last:border-b not-last:border-b-border/30"
          >
            {{ label }}
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  </div>
</template>
