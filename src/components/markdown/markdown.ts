import type { Root } from 'hast'
import type { Component, PropType, SlotsType, VNode } from 'vue'
import type { JSX as Jsx } from 'vue/jsx-runtime'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { h } from 'vue'

import { Fragment, jsx, jsxDEV, jsxs } from 'vue/jsx-runtime'

const componentsGlob = import.meta.glob<any>(
  '~/components/markdown/content/*.vue',
  { eager: true, import: 'default' },
)

function wrapperMarkdownComponent(component: Component) {
  return defineComponent({
    name: 'MarkdownComponent',
    props: {
      node: {
        type: Object,
        required: true,
      },
    },
    slots: Object as SlotsType<{
      default: () => VNode[]
    }>,
    setup({ node }, { attrs, slots }) {
      provide('node', node)
      return () => h(component, attrs, slots)
    },
  })
}

const components = Object.fromEntries(
  Object.entries(componentsGlob).map(([key, component]) => [
    key.replace(/^\/src\/components\/markdown\/content\/(.*)\.vue$/, '$1'),
    wrapperMarkdownComponent(component),
  ]),
)

export const Markdown = defineComponent({
  name: 'Content',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    root: {
      type: Object as PropType<Root>,
      required: true,
    },
  },
  setup({ tag, root }, ctx) {
    return () => h(
      tag,
      ctx.attrs,
      toJsxRuntime(root, {
        Fragment,
        jsx,
        jsxs,
        jsxDEV,
        passNode: true,
        elementAttributeNameCase: 'html',
        // ignoreInvalidStyle: true,
        components,
      }),
    )
  },
})

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace JSX {
    type ElementClass = Jsx.ElementClass
    type Element = Jsx.Element
    type IntrinsicElements = Jsx.IntrinsicElements
  }
}
