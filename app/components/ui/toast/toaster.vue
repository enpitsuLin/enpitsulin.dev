<script setup lang="ts">
import { createToaster, Toast, Toaster } from '@ark-ui/vue/toast'
import { toastInjectionKey } from './use-toast'

const toaster = createToaster({
  max: 5,
  placement: 'top-end',
  overlap: true,
  gap: 24,
})

provide(toastInjectionKey, toaster)
</script>

<template>
  <slot />
  <Toaster
    v-slot="toast"
    :toaster="toaster"
    gap-2
    class="[inset-inline-start:calc(env(safe-area-inset-right,_0px)+1rem)] md:[inset-inline-start:auto]"
  >
    <Toast.Root
      flex="~ items-center justify-between"
      border="~ border rounded-md"
      bg="white/50 dark:zinc-900/50 data-[type=error]:red-500/50 data-[type=error]:dark:red-900/50 data-[type=success]:green-500/50 data-[type=success]:dark:green-900/50 data-[type=info]:blue-500/50 data-[type=info]:dark:blue-900/50 data-[type=warning]:yellow-500/50 data-[type=warning]:dark:yellow-900/50"
      w="full md:100"
      of-hidden p-4 pr-6 shadow-lg backdrop-blur space-x-2
      class="group [will-change:translate,opacity,scale] z-$z-index translate-x-$x translate-y-$y scale-$scale op-$opacity transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full data-[stack]:relative!"
    >
      <div grid="~ gap-1">
        <Toast.Title
          text-sm font-semibold
          class="[&+div]:text-xs"
        >
          {{ toast.title }}
        </Toast.Title>
        <Toast.Description
          text-sm opacity-90
        >
          {{ toast.description }}
        </Toast.Description>
      </div>
      <Toast.ActionTrigger
        v-if="toast.action"
        border="~ border rounded-md"
        bg="black dark:white"
        flex="inline items-center justify-center"
        h-8 bg-transparent px-3
        un-text="sm font-medium zinc-300 dark:zinc-700"
        class="transition-colors disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-1"
      >
        {{ toast.action?.label }}
      </Toast.ActionTrigger>
      <Toast.CloseTrigger
        absolute right-1 top-1
        rounded-md p-1
        op="0 focus:100 group-hover:100"
        class="transition-opacity focus:outline-none focus:ring-1"
      >
        <div i-mingcute:close-line size-4 />
      </Toast.CloseTrigger>
    </Toast.Root>
  </Toaster>
</template>
