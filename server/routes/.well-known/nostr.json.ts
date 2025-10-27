import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Upgrade, Accept, Content-Type, User-Agent')

  return {
    names: {
      me: '0aadfcac7327642509ec22ecb041d2e5257cda66a4565eb43114639bfe9d2ff0',
    },
    relays: {
    },
  }
})
