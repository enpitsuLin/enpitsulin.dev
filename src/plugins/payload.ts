import { defineZootPlugin } from '~~/lib/app'
import { getZootClientPayload } from '~~/lib/payload'

export default defineZootPlugin(async (zootApp) => {
  if (!import.meta.env.SSR) {
    Object.assign(zootApp.payload, await getZootClientPayload())
    // delete window.__ZOOT__
  }
})
