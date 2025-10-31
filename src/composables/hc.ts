import type { AppType } from '~~/server'
import { hc } from 'hono/client'

export function useHC() {
  const url = useRequestURL()
  const $hc = hc<AppType>(url.origin)
  return $hc
}
