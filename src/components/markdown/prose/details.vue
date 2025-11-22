<script setup lang="ts">
import { Collapsible } from '@ark-ui/vue/collapsible'
import { Comment, Fragment, isVNode, Static, Text } from 'vue'

function getType(vnode: unknown) {
  const typeofVNode = typeof vnode
  if (vnode == null || typeofVNode === 'boolean') {
    return 'comment'
  }
  else if (typeofVNode === 'string' || typeofVNode === 'number') {
    return 'text'
  }
  else if (Array.isArray(vnode)) {
    return 'fragment'
  }
  if (isVNode(vnode)) {
    const { type } = vnode
    const typeofType = typeof type
    if (typeofType === 'symbol') {
      if (type === Fragment) {
        return 'fragment'
      }
      else if (type === Text) {
        return 'text'
      }
      else if (type === Comment) {
        return 'comment'
      }
      else if (type === Static) {
        return 'static'
      }
    }
    else if (typeofType === 'string') {
      return 'element'
    }
    else if (typeofType === 'object' || typeofType === 'function') {
      return 'component'
    }
  }
  return void 0
}

function isComponent(vnode: unknown): vnode is (VNode & { type: Component }) {
  return getType(vnode) === 'component'
}

const slots = useSlots()

function Children() {
  const _children = slots.default?.() ?? []

  const trigger = _children.find(c => isComponent(c) && c.type.name === 'MarkdownComponent' && c.props?.node.tagName === 'summary')
  const content = _children.filter(c => c !== trigger)
  return h(Fragment, null, [
    trigger,
    h(Collapsible.Content, null, () => content),
  ])
}
</script>

<template>
  <Collapsible.Root class="group" rounded-md>
    <Children />
  </Collapsible.Root>
</template>

<style>
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
