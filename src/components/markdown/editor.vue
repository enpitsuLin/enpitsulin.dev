<script setup lang="ts">
import { MilkdownProvider } from '@milkdown/vue'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue'
import { MarkdownConsumer } from './milkdown/consumer'

import '@milkdown/crepe/theme/common/prosemirror.css'
import '@milkdown/crepe/theme/common/reset.css'
import '@milkdown/crepe/theme/common/block-edit.css'
import '@milkdown/crepe/theme/common/code-mirror.css'
import '@milkdown/crepe/theme/common/cursor.css'
import '@milkdown/crepe/theme/common/image-block.css'
import '@milkdown/crepe/theme/common/link-tooltip.css'
import '@milkdown/crepe/theme/common/list-item.css'
import '@milkdown/crepe/theme/common/placeholder.css'
import '@milkdown/crepe/theme/common/toolbar.css'
import '@milkdown/crepe/theme/common/table.css'

defineOptions({
  inheritAttrs: false,
})

const { value } = defineProps<{ value: string }>()
const emit = defineEmits<{
  change: [value: string]
  blur: []
}>()
</script>

<template>
  <MilkdownProvider>
    <ProsemirrorAdapterProvider>
      <MarkdownConsumer
        v-bind="$attrs"
        :value="value"
        @change="emit('change', $event)"
        @blur="emit('blur')"
      />
    </ProsemirrorAdapterProvider>
  </MilkdownProvider>
</template>

<style>
.milkdown {
  --crepe-color-background: #ffffff;
  --crepe-color-on-background: #000000;
  --crepe-color-surface: #f7f7f7;
  --crepe-color-surface-low: #ededed;
  --crepe-color-on-surface: #1c1c1c;
  --crepe-color-on-surface-variant: #4d4d4d;
  --crepe-color-outline: #a8a8a8;
  --crepe-color-primary: #333333;
  --crepe-color-secondary: #cfcfcf;
  --crepe-color-on-secondary: #000000;
  --crepe-color-inverse: #f0f0f0;
  --crepe-color-on-inverse: #1a1a1a;
  --crepe-color-inline-code: #ba1a1a;
  --crepe-color-error: #ba1a1a;
  --crepe-color-hover: #e0e0e0;
  --crepe-color-selected: #d5d5d5;
  --crepe-color-inline-area: #cacaca;

  --crepe-font-title: 'Noto Serif', Cambria, 'Times New Roman', Times, serif;
  --crepe-font-default: 'Noto Sans', Arial, Helvetica, sans-serif;
  --crepe-font-code: 'Space Mono', Fira Code, Menlo, Monaco, 'Courier New', Courier, monospace;

  --crepe-shadow-1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  --crepe-shadow-2: 0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}

.dark .milkdown {
  --crepe-color-background: #1a1a1a;
  --crepe-color-on-background: #e6e6e6;
  --crepe-color-surface: #121212;
  --crepe-color-surface-low: #1c1c1c;
  --crepe-color-on-surface: #d1d1d1;
  --crepe-color-on-surface-variant: #a9a9a9;
  --crepe-color-outline: #757575;
  --crepe-color-primary: #b5b5b5;
  --crepe-color-secondary: #4d4d4d;
  --crepe-color-on-secondary: #d6d6d6;
  --crepe-color-inverse: #e5e5e5;
  --crepe-color-on-inverse: #2a2a2a;
  --crepe-color-inline-code: #ff6666;
  --crepe-color-error: #ff6666;
  --crepe-color-hover: #232323;
  --crepe-color-selected: #2f2f2f;
  --crepe-color-inline-area: #2b2b2b;

  --crepe-font-title: 'Noto Serif', Cambria, 'Times New Roman', Times, serif;
  --crepe-font-default: 'Noto Sans', Arial, Helvetica, sans-serif;
  --crepe-font-code: 'Space Mono', Fira Code, Menlo, Monaco, 'Courier New', Courier, monospace;

  --crepe-shadow-1: 0px 1px 2px 0px rgba(255, 255, 255, 0.3), 0px 1px 3px 1px rgba(255, 255, 255, 0.15);
  --crepe-shadow-2: 0px 1px 2px 0px rgba(255, 255, 255, 0.3), 0px 2px 6px 2px rgba(255, 255, 255, 0.15);
}
</style>
