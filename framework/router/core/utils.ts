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
