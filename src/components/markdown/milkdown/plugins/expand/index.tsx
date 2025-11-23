import type { MarkdownNode } from '@milkdown/kit/transformer'
import { $node as $nodeSchema, $remark } from '@milkdown/kit/utils'

import remarkDirective from 'remark-directive'

const milkdownDirectivePlugin = $remark('remarkDirective', () => remarkDirective)

const directiveContainerNode = $nodeSchema('directiveContainerFallback', () => ({
  attrs: {
    name: {
      default: '',
    },
    attrString: {
      default: '',
    },
  },
  content: 'block+',
  group: 'block',
  parseMarkdown: {
    match: ({ type }) => type === 'containerDirective',
    runner: (state, node) => {
      state.openNode(state.schema.nodes.paragraph)
      state.addText(
        `:::${node.name}${attributesToString(
          node.attributes as Record<string, string>,
          node.children,
        )}`,
      )
      state.closeNode()
      state.next(node.children)
      state.openNode(state.schema.nodes.paragraph)
      state.addText(':::')
      state.closeNode()
    },
  },
  toMarkdown: {
    match: () => false,
    runner: () => null,
  },
}))

const directiveLeafNode = $nodeSchema('directiveLeafFallback', () => ({
  attrs: {
    name: {
      default: '',
    },
    attrString: {
      default: '',
    },
  },
  content: 'block',
  group: 'block',
  parseMarkdown: {
    match: ({ type }) => type === 'leafDirective',
    runner: (state, node) => {
      state.openNode(state.schema.nodes.paragraph)
      state.addText(
        `::${node.name}${attributesToString(
          node.attributes as Record<string, string>,
          node.children,
          true,
        )}`,
      )
      state.closeNode()
    },
  },
  toMarkdown: {
    match: () => false,
    runner: () => null,
  },
}))

const directiveTextNode = $nodeSchema('directiveTextFallback', () => ({
  attrs: {
    name: {
      default: '',
    },
    type: {
      default: '',
    },
    attrString: {
      default: '',
    },
  },
  group: 'inline',
  inline: true,
  parseMarkdown: {
    match: ({ type }) => type === 'textDirective',
    runner: (state, node) => {
      state.addText(
        `:${node.name}${attributesToString(
          node.attributes as Record<string, string>,
          node.children,
        )}`,
      )
    },
  },

  toMarkdown: {
    match: () => false,
    runner: () => null,
  },
}))

export const directivePlugin = [
  milkdownDirectivePlugin,
  directiveContainerNode,
  directiveLeafNode,
  directiveTextNode,
].flat()

function attributesToString(attrs: Record<string, string>, children?: MarkdownNode[], isLeaf?: boolean): string {
  let d = ''
  const labelIndex = children
    ? children.findIndex(v => !!v.data?.directiveLabel)
    : -1
  const label = children ? children[labelIndex] : null
  if (label && label.children) {
    d += `[${label.children.map(v => v.value).join(' ')}]`
    children && children.splice(labelIndex, 1)
  }
  if (isLeaf && children && children.length) {
    d += `[${children.map(v => v.value).join(' ')}]`
    children && children.splice(labelIndex, 1)
  }
  if (attrs.id) {
    d += `#${attrs.id}`
  }
  if (attrs.class) {
    const c = attrs.class.split(' ')
    d += `.${c.join('.')}`
  }
  for (const key in attrs) {
    if (key === 'id') {
      continue
    }
    if (key === 'class') {
      continue
    }
    d += ` ${key}="${attrs[key]}"`
  }
  return d
}

declare module 'unist' {
  interface Data {
    // `someNode.data.myId` is typed as `number | undefined`
    directiveLabel?: string
  }
}
