import type { TreeNodeValue, TreePathParam } from './tree-node-value'
import { createTreeNodeValue } from './tree-node-value'

export class TreeNode<Module = any, Meta extends Record<string, any> = Record<string, any>> {
  value: TreeNodeValue<Module, Meta>
  children: Map<string, TreeNode<Module, Meta>> = new Map()
  parent: TreeNode<Module, Meta> | undefined
  layout: TreeNode<Module, Meta> | undefined

  constructor(
    pathSegment: string,
    parent?: TreeNode<Module, Meta>,
  ) {
    this.parent = parent
    this.value = createTreeNodeValue(
      pathSegment,
      parent?.value,
    )
  }

  insert(path: string, thing: Module, meta?: Meta): TreeNode<Module, Meta> {
    const { tail, segment } = splitFilePath(path)

    if (segment === '_layout') {
      this.layout = new TreeNode(segment, this)
      this.layout.value.module = thing
      return this.layout
    }

    if (!this.children.has(segment)) {
      this.children.set(segment, new TreeNode(segment, this))
    }
    else {
      // TODO: else error or still override?
    }
    const child = this.children.get(segment)!

    // we reached the end of the filePath, therefore it's a component
    if (!tail) {
      child.value.module = thing
      child.value.meta = meta
    }
    else {
      return child.insert(tail, thing, meta)
    }
    return child
  }

  * getChildrenDeep(): Generator<TreeNode<Module, Meta>> {
    for (const child of this.children.values()) {
      yield child
      yield* child.getChildrenDeep()
    }
  }

  /**
   * Comparator function for sorting TreeNodes.
   *
   * @internal
   */
  static compare(a: TreeNode, b: TreeNode): number {
    // for this case, ASCII, short list, it's better than Internation Collator
    // https://stackoverflow.com/questions/77246375/why-localecompare-can-be-faster-than-collator-compare
    return a.path.localeCompare(b.path, 'en')
  }

  /**
   * Get the children of this node sorted by their path.
   */
  getChildrenSorted(): TreeNode<Module, Meta>[] {
    return Array.from(this.children.values()).sort(TreeNode.compare)
  }

  /**
   * Calls {@link getChildrenDeep} and sorts the result by path in the end.
   */
  getChildrenDeepSorted(): TreeNode<Module, Meta>[] {
    return Array.from(this.getChildrenDeep()).sort(TreeNode.compare)
  }

  get path() {
    return (this.parent?.value.fullPath === '/' ? '/' : '') + this.value.path
  }

  get fullPath() {
    return this.value.fullPath
  }

  /**
   * Array of route params for this node. It includes **all** the params from the parents as well.
   */
  get params(): TreePathParam[] {
    const params = [...this.value.params]
    let node = this.parent
    // add all the params from the parents
    while (node) {
      params.unshift(...node.value.params)
      node = node.parent
    }

    return params
  }

  get meta() {
    return this.value.meta
  }

  get module() {
    return this.value.module
  }

  /**
   * Is this node a catch-all param
   */
  get isCatchAll(): boolean {
    return this.value.isParam() && this.value.pathParams.some(p => p.catchAll)
  }
}

/**
 * Splits a path into by finding the first '/' and returns the tail and segment. If it has an extension, it removes it.
 * If it contains a named view, it returns the view name as well (otherwise it's default).
 *
 * @param filePath - filePath to split
 */
function splitFilePath(filePath: string) {
  const slashPos = filePath.indexOf('/')
  const head = slashPos < 0 ? filePath : filePath.slice(0, slashPos)
  const tail = slashPos < 0 ? '' : filePath.slice(slashPos + 1)

  return {
    segment: head,
    tail,
  }
}
