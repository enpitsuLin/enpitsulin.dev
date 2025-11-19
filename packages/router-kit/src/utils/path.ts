/**
 * Normalize path to ensure it starts with '/'
 */
export function normalizePath(path: string): string {
  if (!path) {
    return '/'
  }
  return path.startsWith('/') ? path : `/${path}`
}

export const LEADING_SLASH_RE = /^\//
export const TRAILING_SLASH_RE = /\/$/
export const ESCAPED_TRAILING_SLASH_RE = /\\\/$/

export function joinPath(...paths: string[]): string {
  let result = ''
  for (const path of paths) {
    result
      = result.replace(TRAILING_SLASH_RE, '')
      // check path to avoid adding a trailing slash when joining an empty string
        + (path && `/${path.replace(LEADING_SLASH_RE, '')}`)
  }
  return result || '/'
}

/**
 * Splits a path into by finding the first '/' and returns the tail and segment. If it has an extension, it removes it.
 * If it contains a named view, it returns the view name as well (otherwise it's default).
 *
 * @param filePath - filePath to split
 */
export function splitFilePath(filePath: string) {
  const slashPos = filePath.indexOf('/')
  const head = slashPos < 0 ? filePath : filePath.slice(0, slashPos)
  const tail = slashPos < 0 ? '' : filePath.slice(slashPos + 1)

  let segment = head
  let viewName = 'default'

  const namedSeparatorPos = segment.indexOf('@')

  if (namedSeparatorPos > 0) {
    viewName = segment.slice(namedSeparatorPos + 1)
    segment = segment.slice(0, namedSeparatorPos)
  }
  return {
    segment: head,
    tail,
    viewName,
  }
}
