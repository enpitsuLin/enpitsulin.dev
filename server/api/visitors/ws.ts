import type { Peer } from 'crossws'

export default defineWebSocketHandler({
  open(peer) {
    const count = uniquePeers([...peer.peers]).size

    peer.subscribe('visitors')
    peer.send(count)
    peer.publish('visitors', count)
  },

  close(peer) {
    const count = uniquePeers([...peer.peers]).size
    peer.publish('visitors', count)
    peer.unsubscribe('visitors')
  },
})

function uniquePeers(peers: Peer[]) {
  return new Set(peers.map(p => getClientIP(p.request as Request)).filter(Boolean))
}

function getClientIP(request: Request) {
  if (!request.headers) {
    console.error('No headers found in request', request)
    return null
  }
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // 'x-forwarded-for' may contain a list of addresses, grab the first one
    return xForwardedFor.split(',')[0].trim()
  }

  return request.headers.get('cf-connecting-ipv6') || request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip')
}
