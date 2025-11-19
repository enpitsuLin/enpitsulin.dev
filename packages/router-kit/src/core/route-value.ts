import type { RouterContext } from '../context'
import type { SubSegment, TreePathParam } from '../utils/segment'
import { joinPath } from '../utils/path'
import { escapeRegex, parseSegment } from '../utils/segment'

// eslint-disable-next-line no-restricted-syntax
export const enum RouteValueType {
  static,
  group,
  param,
}

class _RouteValue<
  Context extends RouterContext = RouterContext,
> {
  /**
   * flag based on the type of the segment
   */
  _type: RouteValueType

  parent: RouteValue<Context> | undefined

  /**
   * segment as defined by the file structure e.g. keeps the `index` name, `(group-name)`
   */
  rawSegment: string

  /**
   * transformed version of the segment into a path-to-regexp path.
   * e.g. `'index'` becomes `''` and `[param]` becomes `:param`, `prefix-[param]-end` becomes `prefix-:param-end`.
   */
  pathSegment: string

  /**
   * Array of sub segments. This is usually one single elements but can have more for paths like `prefix-[param]-end.vue`
   */
  subSegments: SubSegment[]

  views = new Map<string, Context>()

  constructor(
    rawSegment: string,
    parent: RouteValue<Context> | undefined,
    pathSegment: string = rawSegment,
    subSegments: SubSegment[] = [pathSegment],
  ) {
    this._type = 0
    this.rawSegment = rawSegment
    this.pathSegment = pathSegment
    this.subSegments = subSegments
    this.parent = parent
  }

  get path(): string {
    return this.pathSegment
  }

  get fullPath(): string {
    const pathSegment = this.path
    // if the path is absolute, we don't need to join it with the parent
    if (pathSegment.startsWith('/')) {
      return pathSegment
    }

    return joinPath(this.parent?.fullPath ?? '', pathSegment)
  }

  /**
   * Gets all the params for the node including path and query params. This
   * does not include params from parent nodes.
   */
  get params(): TreePathParam[] {
    return this.isParam() ? this.pathParams : []
  }

  isParam(): this is RouteValueParam {
    return !!(this._type & RouteValueType.param)
  }

  isStatic(): this is RouteValueStatic {
    return this._type === RouteValueType.static
  }

  isGroup(): this is RouteValueGroup {
    return this._type === RouteValueType.group
  }
}

export class RouteValueStatic<Ctx extends RouterContext = RouterContext> extends _RouteValue<Ctx> {
  override _type: RouteValueType.static = RouteValueType.static
  readonly score = [300]
}

export class RouteValueGroup<Ctx extends RouterContext = RouterContext> extends _RouteValue<Ctx> {
  override _type: RouteValueType.group = RouteValueType.group

  groupName: string

  readonly score = [300]

  constructor(
    rawSegment: string,
    parent: RouteValue<Ctx> | undefined,
    pathSegment: string,
    groupName: string,
  ) {
    super(rawSegment, parent, pathSegment)
    this.groupName = groupName
  }
}

export class RouteValueParam<Ctx extends RouterContext = RouterContext> extends _RouteValue<Ctx> {
  override _type: RouteValueType.param = RouteValueType.param

  constructor(
    rawSegment: string,
    parent: RouteValue<Ctx> | undefined,
    public pathParams: TreePathParam[],
    pathSegment: string,
    subSegments: SubSegment[],
  ) {
    super(rawSegment, parent, pathSegment, subSegments)
  }

  get score(): number[] {
    return this.subSegments.map((segment) => {
      if (typeof segment === 'string') {
        // Static subsegment gets highest score
        return 300
      }
      else {
        // Parameter subsegment - calculate malus based on param properties
        const malus = segment.isSplat
          ? 500
          : (segment.optional ? 10 : 0) + (segment.repeatable ? 20 : 0)

        return 80 - malus
      }
    })
  }

  /**
   * Generates the regex pattern for the path segment.
   */
  get re(): string {
    let regexp = ''
    for (let i = 0; i < this.subSegments.length; i++) {
      const segment = this.subSegments[i]
      // skip empty sub segments
      if (!segment)
        continue

      if (typeof segment === 'string') {
        regexp += escapeRegex(segment)
      }
      else if (segment.isSplat) {
        regexp += '(.*)'
      }
      else {
        let re = segment.repeatable ? '(.+?)' : '([^/]+?)'
        if (segment.optional) {
          // check ahead if there is a static segment after this one that starts with a slash
          // TODO: trailingSlash behavior
          const prevSegment = this.subSegments[i - 1]
          // is there a slash right before us
          if (
            (!prevSegment
              || (typeof prevSegment === 'string' && prevSegment.endsWith('/')))
            // avoid the transformation when the optional param is the whole path
            && this.subSegments.length > 1
          ) {
            re = `(?:\\/${re})?`
            // remove the escaped trailing slash from the previous static segment
            regexp = regexp.slice(0, -2)
          }
          else {
            // just make the regexp group optional
            re += '?'
          }
        }
        regexp += re
      }
    }
    return regexp
  }
}

export type RouteValue<Context extends RouterContext = RouterContext>
  = RouteValueParam<Context>
    | RouteValueStatic<Context>
    | RouteValueGroup<Context>

export function createRouteValue<
  Context extends RouterContext = RouterContext,
>(segment: string, parent?: RouteValue<Context>): RouteValue<Context> {
  if (!segment || segment === 'index') {
    return new RouteValueStatic(segment, parent, '')
  }

  // extract the group between parentheses
  const openingPar = segment.indexOf('(')

  if (openingPar !== -1) {
    const closingPar = segment.lastIndexOf(')')
    if (closingPar < 0 || closingPar < openingPar) {
      console.warn(
        `Segment "${segment}" is missing the closing ")". It will be treated as a static segment.`,
      )

      // avoid parsing errors
      return new RouteValueStatic(segment, parent, segment)
    }

    const groupName = segment.slice(openingPar + 1, closingPar)
    const before = segment.slice(0, openingPar)
    const after = segment.slice(closingPar + 1)

    if (!before && !after) {
      // pure group: no contribution to the path
      return new RouteValueGroup(segment, parent, '', groupName)
    }
  }

  const [pathSegment, pathParams, subSegments] = parseSegment(segment)

  if (pathParams.length) {
    return new RouteValueParam(
      segment,
      parent,
      pathParams,
      pathSegment,
      subSegments,
    )
  }

  return new RouteValueStatic(segment, parent, pathSegment)
}
