import type { Peer } from 'crossws'
import type { VisitorsMessage } from '#shared/types/visitors'
import { defineWebSocketHandler } from 'nitro'
import { visitorPageMessageSchema } from '#shared/schemas/visitors'
import { getVisitorState, setVisitorState } from '../../utils/visitor-state'

export default defineWebSocketHandler({
  open(peer) {
    broadcastVisitors(peer)
  },

  message(peer, message) {
    let payload: unknown
    try {
      payload = message.json()
    }
    catch {
      return
    }
    const result = visitorPageMessageSchema.safeParse(payload)
    if (!result.success)
      return

    setVisitorState(peer, { ...getVisitorState(peer), path: result.data.path })
    broadcastVisitors(peer)
  },

  close(peer) {
    // Durable Objects require the server to acknowledge the close frame.
    peer.close()
    broadcastVisitors(peer, peer.id)
  },

  error(peer) {
    broadcastVisitors(peer, peer.id)
  },
})

function broadcastVisitors(peer: Peer, excludedPeerId?: string) {
  const peers = [...peer.peers]
    .filter(p => p.id !== excludedPeerId && p.websocket.readyState === 1)
    .map(p => ({ peer: p, state: getVisitorState(p) }))
  const visitors = new Set<string>()
  const pages = new Map<string, Set<string>>()

  for (const { state: { visitor, path } } of peers) {
    visitors.add(visitor)
    if (path === null)
      continue

    const pageVisitors = pages.get(path) ?? new Set<string>()

    pageVisitors.add(visitor)
    pages.set(path, pageVisitors)
  }

  for (const { peer: connectedPeer, state: { path } } of peers) {
    if (path === null)
      continue

    const message: VisitorsMessage = {
      visitors: visitors.size,
      pageVisitors: pages.get(path)!.size,
      path,
    }
    connectedPeer.send(message)
  }
}
