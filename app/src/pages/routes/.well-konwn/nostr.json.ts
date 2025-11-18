export function GET(): Response {
  return Response.json(
    {
      names: {
        me: '0aadfcac7327642509ec22ecb041d2e5257cda66a4565eb43114639bfe9d2ff0',
      },
      relays: {
      },
    },
    {
      headers: [
        ['Content-Type', 'application/json'],
        ['Access-Control-Allow-Origin', '*'],
        ['Access-Control-Allow-Methods', 'GET, OPTIONS'],
        ['Access-Control-Allow-Headers', 'Upgrade, Accept, Content-Type, User-Agent'],
      ],
    },
  )
}

export function getConfig() {
  return {
    render: 'static',
  } as const
}
