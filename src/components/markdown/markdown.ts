import type { Root } from 'hast'
import type { Props } from 'hast-util-to-jsx-runtime'
import type { Component, PropType, SlotsType, VNode } from 'vue'
import type { JSX as Jsx } from 'vue/jsx-runtime'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { capitalize, h } from 'vue'

import { Fragment } from 'vue/jsx-runtime'

const componentsGlob = import.meta.glob<Component>(
  '~/components/markdown/prose/*.vue',
  { eager: true, import: 'default', base: './prose' },
)

function wrapperProseComponent(component: Component, name: string) {
  return defineComponent({
    name: `ProseComponent${capitalize(name)}`,
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
  Object.entries(componentsGlob).map(([key, component]) => {
    const name = key.replace(/^\.\/(.*)\.vue$/, '$1')
    return [
      name,
      wrapperProseComponent(component, name),
    ]
  }),
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
        jsxs: jsx,
        jsxDEV: jsx,
        passNode: true,
        elementAttributeNameCase: 'html',
        // ignoreInvalidStyle: true,
        components,
      }),
    )
  },
})

function jsx(type: any, props: Props, key?: string): JSX.Element {
  const { children } = props
  delete props.children
  if (key) {
    props.key = key
  }

  if (isComponent(type)) {
    return h(type, props, () => children)
  }
  return h(type, props, children!)
}

function isComponent(type: any): type is Component {
  return (
    typeof type === 'object'
    || typeof type === 'function'
  )
}

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace JSX {
    type ElementClass = Jsx.ElementClass
    type Element = Jsx.Element
    type IntrinsicElements = Jsx.IntrinsicElements
  }
}
