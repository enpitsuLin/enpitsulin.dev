import { joinPath } from './utils'

export type TypeDefinition = 'static' | 'group' | 'param'
export type ParseFileSegmentState = 'static' | 'param' | 'paramOptional'

export interface TreeNodeValueContext {
  type: TypeDefinition
  segment: string
}

export interface TreeNodeValueOptions {
  segment: string
}

export interface TreePathParam {
  paramName: string
  optional: boolean
  catchAll: boolean
}

class TreeNodeValueBase<Module, Meta extends Record<string, any>> {
  type!: TypeDefinition

  parent: TreeNodeValue<Module, Meta> | undefined
  /**
   * raw segment, keeps the `index` name, `(group-name)`
   */
  rawSegment: string
  /**
   * transformed version of the segment
   */
  pathSegment: string

  module: Module = {} as Module

  meta?: Meta

  constructor(
    rawSegment: string,
    parent: TreeNodeValue<Module, Meta> | undefined,
    pathSegment: string = rawSegment,
  ) {
    this.rawSegment = rawSegment
    this.pathSegment = pathSegment
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

  get params(): TreePathParam[] {
    if (this.isParam()) {
      return [...this.pathParams]
    }
    return []
  }

  isParam(): this is TreeNodeValueParam<Module, Meta> {
    return this.type === 'param'
  }

  isStatic(): this is TreeNodeValueStatic<Module, Meta> {
    return this.type === 'static'
  }

  isGroup(): this is TreeNodeValueGroup<Module, Meta> {
    return this.type === 'group'
  }
}

export class TreeNodeValueStatic<Module, Meta extends Record<string, any>> extends TreeNodeValueBase<Module, Meta> {
  override type = 'static' as TypeDefinition
  constructor(
    rawSegment: string,
    parent: TreeNodeValueBase<Module, Meta> | undefined,
    pathSegment: string = rawSegment,
  ) {
    super(rawSegment, parent, pathSegment)
  }
}

export class TreeNodeValueParam<Module, Meta extends Record<string, any>> extends TreeNodeValueBase<Module, Meta> {
  override type = 'param' as TypeDefinition
  pathParams: TreePathParam[]

  constructor(
    rawSegment: string,
    parent: TreeNodeValueBase<Module, Meta> | undefined,
    pathParams: TreePathParam[],
    pathSegment: string = rawSegment,
  ) {
    super(rawSegment, parent, pathSegment)
    this.pathParams = pathParams
  }
}

export class TreeNodeValueGroup<Module, Meta extends Record<string, any>> extends TreeNodeValueBase<Module, Meta> {
  override type = 'group' as TypeDefinition
  groupName: string
  constructor(
    segment: string,
    parent: TreeNodeValueBase<Module, Meta> | undefined,
    pathSegment: string,
    groupName: string,
  ) {
    super(segment, parent, pathSegment)
    this.groupName = groupName
  }
}

export type TreeNodeValue<Module, Meta extends Record<string, any>> = TreeNodeValueStatic<Module, Meta>
  | TreeNodeValueParam<Module, Meta>
  | TreeNodeValueGroup<Module, Meta>

export function createTreeNodeValue<Module, Meta extends Record<string, any>>(
  segment: string,
  parent?: TreeNodeValueBase<Module, Meta>,
): TreeNodeValueBase<Module, Meta> {
  if (!segment || segment === 'index') {
    return new TreeNodeValueStatic(segment, parent)
  }

  const openingPar = segment.indexOf('(')

  if (openingPar >= 0) {
    const closingPar = segment.lastIndexOf(')')

    if (closingPar < 0 || closingPar < openingPar) {
      console.warn(
        `Segment "${segment}" is missing the closing ")". It will be treated as a static segment.`,
      )

      // avoid parsing errors
      return new TreeNodeValueStatic(segment, parent)
    }
    const groupName = segment.slice(openingPar + 1, closingPar)
    const before = segment.slice(0, openingPar)
    const after = segment.slice(closingPar + 1)

    if (!before && !after) {
      // pure group: no contribution to the path
      return new TreeNodeValueGroup(segment, parent, '', groupName)
    }
  }

  // Parse route segment to determine type and extract parameters
  const [parsedSegment, pathParams] = parseRouteSegment(segment)

  if (pathParams.length > 0) {
    return new TreeNodeValueParam(segment, parent, pathParams, parsedSegment)
  }

  return new TreeNodeValueStatic(segment, parent)
}

/**
 *
 * - `[name]` => `:name` with `paramName: 'name', optional: false, catchAll: false`
 * - `[[name]]` => `:name?` with `paramName: 'name', optional: true, catchAll: false`
 * - `[...name]` => `*path` with `paramName: 'name', optional: false, catchAll: true`
 */
function parseRouteSegment(segment: string): [string, TreePathParam[]] {
  const params: TreePathParam[] = []
  let parsedSegment = segment

  // Handle catch-all params: [...name] => *name
  const catchAllMatch = segment.match(/\[\.\.\.(\w+)\]/)
  if (catchAllMatch) {
    const paramName = catchAllMatch[1]
    params.push({ paramName, optional: false, catchAll: true })
    parsedSegment = parsedSegment.replace(/\[\.\.\.\w+\]/, `*${paramName}`)
    return [parsedSegment, params]
  }

  // Handle optional params: [[name]] => :name?
  const optionalMatch = segment.match(/\[\[(\w+)\]\]/)
  if (optionalMatch) {
    const paramName = optionalMatch[1]
    params.push({ paramName, optional: true, catchAll: false })
    parsedSegment = parsedSegment.replace(/\[\[(\w+)\]\]/, `:${paramName}?`)
    return [parsedSegment, params]
  }

  // Handle regular params: [name] => :name
  const paramMatch = segment.match(/\[(\w+)\]/)
  if (paramMatch) {
    const paramName = paramMatch[1]
    params.push({ paramName, optional: false, catchAll: false })
    parsedSegment = parsedSegment.replace(/\[(\w+)\]/, `:${paramName}`)
    return [parsedSegment, params]
  }

  return [parsedSegment, params]
}
