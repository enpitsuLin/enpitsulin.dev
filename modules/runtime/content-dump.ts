import { defineHandler } from 'nitro'
import { getRouterParam } from 'nitro/h3'
import { useStorage } from 'nitro/storage'
import { createError, useRuntimeConfig } from 'nuxt/server'

interface AssetsBinding {
  fetch: (request: string) => Promise<Response>
}

function isAssetsBinding(value: unknown): value is AssetsBinding {
  return !!value && typeof value === 'object' && 'fetch' in value && typeof value.fetch === 'function'
}

export default defineHandler(async (event) => {
  const collection = getRouterParam(event, 'collection') || event.url.pathname.split('/')[2] || ''
  event.res.headers.set('Content-Type', 'text/plain')

  const assets = event.req.runtime?.cloudflare?.env.ASSETS
  if (isAssetsBinding(assets)) {
    const url = new URL(event.req.url)
    url.pathname = `${useRuntimeConfig().app.baseURL}dump.${collection}.sql`
    url.search = ''
    const response = await assets.fetch(url.href)
    if (!response.ok)
      throw createError({ status: response.status, statusText: 'Content collection not found' })
    return response.text()
  }

  const dump = await useStorage().getItem<string>(`build:content:raw:dump.${collection}.sql`)
  if (!dump)
    throw createError({ status: 404, statusText: 'Content collection not found' })
  return dump
})
