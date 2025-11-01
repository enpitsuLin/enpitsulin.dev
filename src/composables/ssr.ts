import type { ZootSSRContext } from '~~/lib/app'
import { computed, ref, useSSRContext } from 'vue'

export function useRequestContext() {
  if (!import.meta.env.SSR) {
    return
  }
  const ssrContext = useSSRContext<ZootSSRContext>()
  return ssrContext!.context
}

export function useRequestHeaders<K extends string = string>(include: K[]): { [key in Lowercase<K>]?: string }
export function useRequestHeaders(): Readonly<Record<string, string>>
export function useRequestHeaders(include?: any[]) {
  if (!import.meta.env.SSR) {
    return {}
  }
  const c = useRequestContext()!

  const _headers = c ? c.req.header() : {}
  if (!include || !c) {
    return _headers
  }
  const headers = Object.create(null)
  for (const _key of include) {
    const key = _key.toLowerCase()
    const header = _headers[key]
    if (header) {
      headers[key] = header
    }
  }
  return headers
}

export function useRequestHeader(header: string) {
  if (!import.meta.env.SSR) {
    return undefined
  }
  const event = useRequestContext()
  return event ? event.req.header(header) : undefined
}

export function useResponseHeader(header: string) {
  if (!import.meta.env.SSR) {
    if (import.meta.env.DEV) {
      return computed({
        get: () => undefined,
        set: () => console.warn('Setting response headers is not supported in the browser.'),
      })
    }
    return ref()
  }

  const event = useRequestContext()!

  return computed({
    get() {
      return event.res.headers.get(header)
    },
    set(newValue) {
      if (!newValue) {
        return event.res.headers.delete(header)
      }

      return event.res.headers.set(header, newValue)
    },
  })
}
