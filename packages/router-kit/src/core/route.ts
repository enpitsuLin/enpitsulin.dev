import type { RouterContext } from '../context'
import type { TreePathParam } from '../utils/segment'
import type { RouteValue } from './route-value'
import { ESCAPED_TRAILING_SLASH_RE, splitFilePath } from '../utils/path'
import { escapeRegex } from '../utils/segment'
import { createRouteValue } from './route-value'

export class Route<Context extends RouterContext = RouterContext> {
  value: RouteValue<Context>

  children: Map<string, Route<Context>> = new Map()

  parent: Route<Context> | undefined

  constructor(pathSegment: string, parent?: Route<Context>) {
    this.parent = parent
    this.value = createRouteValue(pathSegment, parent?.value)
  }

  insert(
    path: string,
    context: Context,
  ): Route<Context> {
    const { tail, segment, viewName } = splitFilePath(path)

    if (!this.children.has(segment)) {
      this.children.set(segment, new Route(segment, this))
    }

    const child = this.children.get(segment)!

    if (!tail) {
      child.value.views.set(viewName, context)
    }
    else {
      return child.insert(tail, context)
    }

    return child
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

  /**
   * Returns wether this tree node is the root node of the tree.
   *
   * @returns true if the node is the root node
   */
  isRoot() {
    return (
      !this.parent && this.value.fullPath === '/' && !this.value.views.size
    )
  }

  /**
   * Generates a regexp based on this node and its parents. This regexp is used by the custom resolver
   */
  get regexp(): RegExp {
    // eslint-disable-next-line ts/no-this-alias
    let node: Route<Context> | undefined = this
    // we build the node list from parent to child
    const nodeList: Route<Context>[] = []
    while (node && !node.isRoot()) {
      nodeList.unshift(node)
      node = node.parent
    }

    let re = ''
    for (let i = 0; i < nodeList.length; i++) {
      node = nodeList[i]!
      if (node.value.isParam()) {
        const nodeRe = node.value.re
        // Ensure we add a connecting slash
        // if we already have something in the regexp and if the only part of
        // the segment is an optional param, then the / must be put inside the
        // non-capturing group
        if (
          // if we have a segment before or after
          (re || i < nodeList.length - 1)
          // if the only part of the segment is an optional (can be repeatable) param
          && node.value.subSegments.length === 1
          && (node.value.subSegments.at(0) as TreePathParam).optional
        ) {
          // TODO: tweak if trailingSlash
          re += `(?:\\/${
            // we remove the ? at the end because we add it later
            nodeRe.slice(0, -1)
          })?`
        }
        else {
          re += (re ? '\\/' : '') + nodeRe
        }
      }
      else {
        re += (re ? '\\/' : '') + escapeRegex(node.value.pathSegment)
      }
    }

    return new RegExp(
      `^${
      // Avoid adding a leading slash if the first segment
      // is an optional segment that already includes it
        re.startsWith('(?:\\/') ? '' : '\\/'
      // TODO: trailingSlash
      }${re.replace(ESCAPED_TRAILING_SLASH_RE, '')}$`,
      'i',
    )
  }

  /**
   * Score of the path used for sorting routes.
   */
  get score(): number {
    const scores: number[][] = []
    // eslint-disable-next-line ts/no-this-alias
    let node: Route<Context> | undefined = this

    while (node && !node.isRoot()) {
      scores.unshift(node.value.score)
      node = node.parent
    }

    return scores.flat(2).reduce((acc, cur) => acc + cur, 0)
  }

  get isSplat(): boolean {
    return this.value.isParam() && this.value.pathParams.some(p => p.isSplat)
  }
}
