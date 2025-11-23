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

  const trigger = _children.find(c => isComponent(c) && c.type.name === 'ProseComponentSummary' && c.props?.node.tagName === 'summary')
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
