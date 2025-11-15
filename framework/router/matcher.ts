import type { TreeNode } from './core/tree'

/**
 * Result of matching a path against a TreeNode
 */
export interface MatchResult<Module = any, Meta extends Record<string, any> = Record<string, any>> {
  /**
   * The matched TreeNode node
   */
  node: TreeNode<Module, Meta>
  /**
   * Extracted parameter values from the path
   * - Regular params: string
   * - Optional params: string | undefined
   * - Catch-all params: string[]
   */
  params: Record<string, string | string[] | undefined>
  /**
   * The matched path (using fullPath)
   */
  matchedPath: string
}

/**
 * Normalize a path string by removing leading/trailing slashes and splitting into segments
 */
function normalizePath(path: string): string[] {
  // Remove leading and trailing slashes, then split
  const normalized = path.replace(/^\/+|\/+$/g, '')
  if (!normalized) {
    return []
  }
  return normalized.split('/').filter(Boolean)
}

/**
 * Find all parameter nodes (including optional) in children
 */
function findParamNodes<Module, Meta extends Record<string, any> = Record<string, any>>(
  children: Map<string, TreeNode<Module, Meta>>,
): TreeNode<Module, Meta>[] {
  const paramNodes: TreeNode<Module, Meta>[] = []
  for (const child of children.values()) {
    if (child.value.isParam()) {
      paramNodes.push(child)
    }
  }
  return paramNodes
}

/**
 * Check if a node has a valid module (is a leaf node with content)
 */
function hasModule<Module, Meta extends Record<string, any> = Record<string, any>>(node: TreeNode<Module, Meta>): boolean {
  return !!(node.value.module && Object.keys(node.value.module).length > 0)
}

/**
 * Internal matching function that performs recursive matching
 */
function matchInternal<Module, Meta extends Record<string, any> = Record<string, any>>(
  node: TreeNode<Module, Meta>,
  pathSegments: string[],
  segmentIndex: number,
  collectedParams: Record<string, string | string[] | undefined>,
): MatchResult<Module, Meta> | null {
  // If we've consumed all segments, check if current node has a module
  if (segmentIndex >= pathSegments.length) {
    // Check if this node has a module
    if (hasModule(node)) {
      return {
        node,
        params: collectedParams,
        matchedPath: node.fullPath,
      }
    }

    // Check for index child
    const indexChild = node.children.get('index')
    if (indexChild && hasModule(indexChild)) {
      // Index nodes should use parent's fullPath (they don't contribute to path)
      const matchedPath = node.fullPath === '/' ? '/' : node.fullPath
      return {
        node: indexChild,
        params: collectedParams,
        matchedPath,
      }
    }

    // Check for optional param children (they can match with undefined value)
    const paramNodes = findParamNodes(node.children)
    for (const paramNode of paramNodes) {
      if (!paramNode.value.isParam())
        continue
      const pathParams = paramNode.value.pathParams
      if (pathParams.length === 0)
        continue
      const param = pathParams[0]
      if (param.optional && hasModule(paramNode)) {
        const optionalParams = {
          ...collectedParams,
          [param.paramName]: undefined,
        }
        return {
          node: paramNode,
          params: optionalParams,
          matchedPath: paramNode.fullPath,
        }
      }
      if (param.catchAll && hasModule(paramNode)) {
        const catchAllParams = {
          ...collectedParams,
          [param.paramName]: undefined,
        }
        return {
          node: paramNode,
          params: catchAllParams,
          matchedPath: paramNode.fullPath,
        }
      }
    }

    // No match found at this level
    return null
  }

  const currentSegment = pathSegments[segmentIndex]
  const candidates: MatchResult<Module, Meta>[] = []

  // 1. Try static match first (highest priority)
  const staticChild = node.children.get(currentSegment)
  if (staticChild && staticChild.value.isStatic()) {
    const result = matchInternal(staticChild, pathSegments, segmentIndex + 1, collectedParams)
    if (result) {
      candidates.push(result)
    }
  }

  // 2. Try group nodes (they don't contribute to path but have children)
  for (const child of node.children.values()) {
    if (child.value.isGroup()) {
      const result = matchInternal(child, pathSegments, segmentIndex, collectedParams)
      if (result) {
        candidates.push(result)
      }
    }
  }

  // 3. Try parameter nodes
  const paramNodes = findParamNodes(node.children)
  for (const paramNode of paramNodes) {
    if (!paramNode.value.isParam())
      continue

    const pathParams = paramNode.value.pathParams
    if (pathParams.length === 0)
      continue

    const param = pathParams[0] // Take the first param (should be only one per node)

    // Handle catch-all params
    if (param.catchAll) {
      // Catch-all matches all remaining segments
      const remainingSegments = pathSegments.slice(segmentIndex)
      const catchAllParams = {
        ...collectedParams,
        [param.paramName]: remainingSegments.length > 0 ? remainingSegments : undefined,
      }
      // Try matching with remaining segments consumed
      const result = matchInternal(paramNode, pathSegments, pathSegments.length, catchAllParams)
      if (result) {
        candidates.push(result)
      }
      // Also try if paramNode itself has a module (no segments consumed)
      if (remainingSegments.length === 0 && hasModule(paramNode)) {
        candidates.push({
          node: paramNode,
          params: catchAllParams,
          matchedPath: paramNode.fullPath,
        })
      }
    }
    // Handle optional params
    else if (param.optional) {
      // Try matching with the segment
      const withSegmentParams = {
        ...collectedParams,
        [param.paramName]: currentSegment,
      }
      const resultWith = matchInternal(paramNode, pathSegments, segmentIndex + 1, withSegmentParams)
      if (resultWith) {
        candidates.push(resultWith)
      }

      // Try skipping the segment (optional) - continue matching with current segment
      // This allows optional params in the middle of paths
      const withoutSegmentParams = {
        ...collectedParams,
        [param.paramName]: undefined,
      }
      const resultWithout = matchInternal(paramNode, pathSegments, segmentIndex, withoutSegmentParams)
      if (resultWithout) {
        candidates.push(resultWithout)
      }
    }
    // Handle regular params
    else {
      const paramParams = {
        ...collectedParams,
        [param.paramName]: currentSegment,
      }
      const result = matchInternal(paramNode, pathSegments, segmentIndex + 1, paramParams)
      if (result) {
        candidates.push(result)
      }
    }
  }

  // 4. Try index child if current segment is empty or 'index'
  if (!currentSegment || currentSegment === 'index') {
    const indexChild = node.children.get('index')
    if (indexChild) {
      const result = matchInternal(indexChild, pathSegments, segmentIndex + 1, collectedParams)
      if (result) {
        candidates.push(result)
      }
    }
  }

  // Select the best match: prefer static over param, prefer more specific (fewer params)
  if (candidates.length === 0) {
    return null
  }

  // Sort candidates: static first, then by number of params (fewer is better)
  candidates.sort((a, b) => {
    // Find the first differing node in the path from root
    const getPathNodes = (result: MatchResult<Module>): TreeNode<Module>[] => {
      const nodes: TreeNode<Module>[] = []
      let n: TreeNode<Module> | undefined = result.node
      while (n) {
        nodes.unshift(n)
        n = n.parent
      }
      return nodes
    }

    const aNodes = getPathNodes(a)
    const bNodes = getPathNodes(b)

    // Find the first node where they differ (excluding root)
    let diffIndex = 1
    while (diffIndex < aNodes.length && diffIndex < bNodes.length) {
      if (aNodes[diffIndex] !== bNodes[diffIndex]) {
        break
      }
      diffIndex++
    }

    // Compare the first differing node
    if (diffIndex < aNodes.length && diffIndex < bNodes.length) {
      const aNode = aNodes[diffIndex]
      const bNode = bNodes[diffIndex]

      const aIsStatic = aNode.value.isStatic()
      const bIsStatic = bNode.value.isStatic()
      if (aIsStatic && !bIsStatic)
        return -1
      if (!aIsStatic && bIsStatic)
        return 1
    }

    // Both are same type, prefer fewer params, but prefer defined params over undefined
    const aParamCount = Object.keys(a.params).filter(k => a.params[k] !== undefined).length
    const bParamCount = Object.keys(b.params).filter(k => b.params[k] !== undefined).length
    if (aParamCount !== bParamCount) {
      return aParamCount - bParamCount
    }
    // If same param count, prefer candidates with more defined values
    const aDefinedCount = Object.values(a.params).filter(v => v !== undefined).length
    const bDefinedCount = Object.values(b.params).filter(v => v !== undefined).length
    return bDefinedCount - aDefinedCount // Reverse: more defined is better
  })

  return candidates[0]
}

/**
 * Match a path string against a TreeNode root and return the matched node with extracted parameters
 *
 * @param path - The path string to match (e.g., '/blog/123')
 * @param root - The root TreeNode to match against
 * @returns MatchResult if a match is found, null otherwise
 *
 * @example
 * ```ts
 * const tree = new TreeNode('/')
 * tree.insert('blog/[id]', { default: BlogPost })
 * const result = match('/blog/123', tree)
 * // result.params = { id: '123' }
 * ```
 */
export function match<Module = any, Meta extends Record<string, any> = Record<string, any>>(
  path: string,
  root: TreeNode<Module, Meta>,
): MatchResult<Module, Meta> | null {
  // Handle root path
  if (path === '/' || path === '') {
    // Check if root has a module
    if (root.value.module && Object.keys(root.value.module).length > 0) {
      return {
        node: root,
        params: {},
        matchedPath: root.fullPath,
      }
    }

    // Check for index child
    const indexChild = root.children.get('index')
    if (indexChild && indexChild.value.module && Object.keys(indexChild.value.module).length > 0) {
      // Index nodes at root should use '/' as matchedPath
      return {
        node: indexChild,
        params: {},
        matchedPath: '/',
      }
    }

    // Check for index child in group nodes (groups don't contribute to path)
    for (const child of root.children.values()) {
      if (child.value.isGroup()) {
        const groupIndexChild = child.children.get('index')
        if (groupIndexChild && groupIndexChild.value.module && Object.keys(groupIndexChild.value.module).length > 0) {
          return {
            node: groupIndexChild,
            params: {},
            matchedPath: '/',
          }
        }
      }
    }

    return null
  }

  const pathSegments = normalizePath(path)
  if (pathSegments.length === 0) {
    // Empty path after normalization, same as root
    return match('/', root)
  }

  return matchInternal(root, pathSegments, 0, {})
}
