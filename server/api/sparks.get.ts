import { fetchSparks } from '../utils/ech0'

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page === undefined ? 1 : Number(query.page)
  if (Array.isArray(query.page) || !Number.isSafeInteger(page) || page < 1 || page > 10000)
    throw createError({ statusCode: 400, statusMessage: 'Invalid page' })

  const config = useRuntimeConfig(event)
  try {
    return await fetchSparks({ baseUrl: config.ech0BaseUrl, tag: config.ech0Tag, page })
  }
  catch (error) {
    console.error('[sparks] Failed to load Ech0 posts', error)
    throw createError({ statusCode: 502, statusMessage: 'Unable to load sparks' })
  }
}, {
  maxAge: 60,
  swr: false,
})
