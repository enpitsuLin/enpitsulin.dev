import { getRequestURL } from 'h3'

export function useRequestURL(opts?: Parameters<typeof getRequestURL>[1]) {
  if (import.meta.env.SSR) {
    return getRequestURL(useRequestEvent()!, opts)
  }
  // we use globalThis to avoid crashes in web workers
  return new URL(globalThis.location.href)
}
