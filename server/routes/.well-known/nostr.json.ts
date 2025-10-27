import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  event.res.headers.set('Content-Type', 'application/json')
  event.res.headers.set('Access-Control-Allow-Origin', '*')
  event.res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  event.res.headers.set('Access-Control-Allow-Headers', 'Upgrade, Accept, Content-Type, User-Agent')

  return {
    names: {
      me: '0aadfcac7327642509ec22ecb041d2e5257cda66a4565eb43114639bfe9d2ff0',
    },
    relays: {
    },
  }
})
