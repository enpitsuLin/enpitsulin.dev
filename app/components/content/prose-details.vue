<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot } from '@ark-ui/vue'
import { isTag } from '@nuxtjs/mdc/runtime'
import { Fragment } from 'vue'

const slots = useSlots()

function Children() {
  const _children = slots.default?.() ?? []
  const trigger = _children.filter((c) => {
    return isTag(c, 'summary')
  })
  const content = _children.filter(c => !trigger.includes(c))

  return h(
    Fragment,
    [
      trigger,
      h(CollapsibleContent, () => content),
    ],
  )
}
</script>

<template>
  <CollapsibleRoot class="group" rounded-md>
    <Children />
  </CollapsibleRoot>
</template>

<style scoped>
@keyframes slideDown {
  from {
    height: 0;
  }

  to {
    height: var(--height);
  }
}

@keyframes slideUp {
  from {
    height: var(--height);
  }

  to {
    height: 0;
  }
}

[data-scope='collapsible'][data-part='root'] {
  overflow: hidden;
  margin: 1em 0;
  padding: 1rem 1.25rem;
  background: var(--un-prose-bg-soft);
}

[data-scope='collapsible'][data-part='content'] {
  margin-top: 0.6em;
}

[data-scope='collapsible'][data-part='content'][data-state='open'] {
  animation: slideDown 350ms;
  animation-timing-function: var(--ease-spring);
}

[data-scope='collapsible'][data-part='content'][data-state='closed'] {
  animation: slideUp 300ms;
  animation-timing-function: var(--ease-spring);
}
</style>
