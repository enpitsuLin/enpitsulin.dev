import { parse } from 'devalue'
import { useZootApp } from '~~/lib/app'

let payloadCache: Record<string, any> = {}

export async function getZootClientPayload() {
  if (import.meta.env.SSR) {
    return {}
  }

  const el = document.getElementById('__ZOOT_DATA__')
  if (!el) {
    return {}
  }

  const inlineData = await parsePayload(el.textContent || '')

  payloadCache = {
    ...inlineData,
    ...window.__ZOOT__,
  }

  return payloadCache
}

export async function parsePayload(payload: string) {
  return await parse(payload, useZootApp()._payloadRevivers)
}

export function definePayloadReducer(
  name: string,
  reduce: (data: any) => any,
) {
  if (import.meta.env.SSR) {
    useZootApp().ssrContext!._payloadReducers[name] = reduce
  }
}

export function definePayloadReviver(
  name: string,
  revive: (data: any) => any | undefined,
) {
  if (import.meta.env.DEV && !useZootApp()) {
    console.warn('[definePayloadReviver] This function must be called in a plugin that is `unshift`ed to the beginning of the plugins array.')
  }
  if (!import.meta.env.SSR) {
    useZootApp()._payloadRevivers[name] = revive
  }
}
