<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'
import { ark } from '@ark-ui/vue'
import { normalizeClass } from 'vue'

interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'small' | 'large'
  asChild?: boolean
}

const {
  size = 'default',
  variant = 'default',
  asChild,
  ...props
} = defineProps<ButtonProps>()
</script>

<template>
  <ark.button
    v-bind="props"
    :as-child="asChild"
    flex="inline items-center justify-center gap-2"
    :p="normalizeClass({
      'x2 y1': size === 'small',
      'x3 y2': size === 'default',
      'x5 y3': size === 'large',
    })"
    :bg="normalizeClass({
      'zinc-800 hover:zinc-700 dark:zinc-50 dark:hover:zinc-100': variant === 'default',
      'zinc-800/5 hover:zinc-700/10 dark:zinc-50/5 dark:hover:zinc-100/10': variant === 'outline',
      'transparent hover:zinc-200/50 dark:hover:zinc-700/50': variant === 'ghost',
    })"
    :un-text="normalizeClass([
      'font-medium',
      {
        'zinc-50 xs dark:zinc-900': variant === 'default',
        'zinc-900 xs dark:zinc-50': variant === 'outline' || variant === 'ghost',
      },
    ])"
    :border="normalizeClass([
      {
        '~ zinc-600/50 dark:zinc-400/50': variant === 'outline',
      },
      'rounded-lg',
    ])"
    class="transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <slot />
  </ark.button>
</template>
