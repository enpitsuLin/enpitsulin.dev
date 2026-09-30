import { defineCachedHandler } from 'nitro/cache'
import { getQuery } from 'nitro/h3'
import { createError, useRuntimeConfig } from 'nuxt/server'
import { fetchSparks } from '../utils/ech0'

export default defineCachedHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page === undefined ? 1 : Number(query.page)
  if (Array.isArray(query.page) || !Number.isSafeInteger(page) || page < 1 || page > 10000)
    throw createError({ status: 400, statusText: 'Invalid page' })

  const config = useRuntimeConfig()
  try {
    return await fetchSparks({ baseUrl: config.ech0BaseUrl, tag: config.ech0Tag, page, token: config.ech0Token })
  }
  catch (error) {
    console.error('[sparks] Failed to load Ech0 posts', error)
    throw createError({ status: 502, statusText: 'Unable to load sparks' })
  }
}, {
  maxAge: 60,
  swr: false,
  allowQuery: ['page'],
})
