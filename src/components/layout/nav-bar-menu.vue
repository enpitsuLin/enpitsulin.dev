<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog'
import { navigation } from '~/constants'
</script>

<template>
  <div
    relative ml-auto
    class="transform animate-duration-1300 animate-ease-$spring-easing animate-in slide-in-from-top-70px md:hidden"
  >
    <Dialog.Root>
      <Dialog.Trigger
        bg="zinc-50/50 dark:zinc-950/50"
        px-4 py="2"
        flex="inline items-center gap-1"
        border="~ border rounded-full" outline-none
        class="shadow-black/10 shadow-md backdrop-blur-0.5rem transition-background-color"
      >
        前往
        <div class="i-mingcute:down-line size-4" />
      </Dialog.Trigger>
      <Teleport to="body">
        <Dialog.Backdrop
          bg="zinc-800/40 dark:bg-black/40"
          class="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        />
        <Dialog.Positioner>
          <Dialog.Content
            class="fixed inset-x-4 top-8 z-100 origin-top rounded-3xl from-zinc-100/75 to-white bg-gradient-to-b p-8 ring-1 ring-zinc-900/5 dark:from-zinc-900/50 dark:to-zinc-900 dark:ring-zinc-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
          >
            <div flex="~ row-reverse items-center justify-between">
              <Dialog.CloseTrigger>
                <div class="i-mingcute:close-line size-4" />
              </Dialog.CloseTrigger>
              <h2 un-text="sm font-medium zinc-600 dark:zinc-400">
                站内导航
              </h2>
            </div>
            <nav mt-6>
              <ul
                un-text="base text-zinc-800 dark:text-zinc-300"
                class="-my-2 divide-y divide-zinc-500/20 dark:divide-zinc-100/5"
              >
                <li v-for="{ href, label } in navigation" :key="href">
                  <RouterLink v-slot="{ navigate, href }" :to="href" custom block py-2>
                    <Dialog.CloseTrigger as-child @click="navigate">
                      <a :href="href">
                        {{ label }}
                      </a>
                    </Dialog.CloseTrigger>
                  </RouterLink>
                </li>
              </ul>
            </nav>
          </Dialog.Content>
        </Dialog.Positioner>
      </Teleport>
    </Dialog.Root>
  </div>
</template>
