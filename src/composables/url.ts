import { useRequestContext } from './ssr'

export function useRequestURL() {
  if (import.meta.env.SSR) {
    const context = useRequestContext()!
    return new URL(context.req.url)
  }
  // we use globalThis to avoid crashes in web workers
  return new URL(globalThis.location.href)
}
