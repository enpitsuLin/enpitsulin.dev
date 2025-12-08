export default defineWebSocketHandler({
  open(peer) {
    // console.log('open', peer, peer.remoteAddress, Object.fromEntries(peer._internal.request.headers.entries()))
    peer.subscribe('visitors')
    peer.send(peer.peers.size)
    peer.publish('visitors', peer.peers.size)
  },

  close(peer) {
    peer.publish('visitors', peer.peers.size)
    peer.unsubscribe('visitors')
  },
  // upgrade(request) {
  //   const xForwardedFor = request.headers.get('x-forwarded-for')
  //   const realIp = request.headers.get('x-real-ip')
  //   const cfConnectingIp = request.headers.get('cf-connecting-ip')

  //   request.context.ip = [xForwardedFor, realIp, cfConnectingIp].filter(Boolean).join(', ')

  //   return {
  //     headers: {
  //       'x-powered-by': 'cross-ws',
  //       'x-forwarded-for': [xForwardedFor, realIp, cfConnectingIp].filter(Boolean).join(', '),
  //     },
  //   }
  // },
})
