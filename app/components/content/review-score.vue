<script setup lang="ts">
import { Tooltip } from '@ark-ui/vue/tooltip'

defineProps<{
  label: string
  score: number
}>()

const open = shallowRef(false)
const root = useTemplateRef<HTMLElement>('root')
const content = useTemplateRef<HTMLElement>('content')
onClickOutside(root, () => {
  open.value = false
}, { ignore: [content] })
</script>

<template>
  <div ref="root">
    <Tooltip.Root
      v-model:open="open" interactive :open-delay="100" :close-delay="150"
      :close-on-click="false" :close-on-pointer-down="false" :close-on-scroll="false"
      :positioning="{ placement: 'top', strategy: 'fixed', gutter: 8, overflowPadding: 16 }"
    >
      <Tooltip.Trigger
        type="button" min-h-11 min-w-14 rounded-md px-1.5 py-1
        flex="~ col items-center justify-center" cursor-help
        un-text="zinc-800 dark:zinc-100"
        ring="focus-visible:2 focus-visible:accent" ring-offset="2 background"
        :aria-label="`${label}，${score} / 10 分`"
        @click="open = true"
      >
        <span text-sm font-medium underline decoration="dotted zinc-400" underline-offset-4>{{ label }}</span>
        <span mt-0.5 whitespace-nowrap font-sans text-xs tabular-nums>
          <span font-semibold>{{ score }}</span><span un-text="zinc-500 dark:zinc-400"> / 10</span>
        </span>
      </Tooltip.Trigger>
      <Teleport v-if="open" to="body">
        <div ref="content">
          <Tooltip.Positioner z-50>
            <Tooltip.Content
              class="not-prose w-72 max-w-[calc(100vw-2rem)] rounded-lg px-3 py-2.5 text-sm leading-6 shadow-lg"
              border="~ zinc-200 dark:zinc-700"
              bg="white dark:zinc-800" un-text="zinc-700 dark:zinc-100"
            >
              <slot />
            </Tooltip.Content>
          </Tooltip.Positioner>
        </div>
      </Teleport>
    </Tooltip.Root>
  </div>
</template>
