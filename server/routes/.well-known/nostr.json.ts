import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler((event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Upgrade, Accept, Content-Type, User-Agent',
  }
  for (const [name, value] of Object.entries(headers))
    event.res.headers.set(name, value)

  return {
    names: {
      me: '0aadfcac7327642509ec22ecb041d2e5257cda66a4565eb43114639bfe9d2ff0',
    },
    relays: {
    },
  }
})
