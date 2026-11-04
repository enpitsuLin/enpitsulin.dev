import type { Peer } from 'crossws'
import { visitorPathSchema } from '#shared/schemas/visitors'

interface VisitorState {
  visitor: string
  path: string | null
}

interface VisitorAttachment {
  visitorState?: VisitorState
  [key: string]: unknown
}

type AttachmentSocket = Pick<WebSocket, 'serializeAttachment' | 'deserializeAttachment'>

export function getVisitorState(peer: Peer): VisitorState {
  const cached = peer.context.visitorState as VisitorState | undefined
  if (cached)
    return cached

  const attachment = getAttachmentSocket(peer)?.deserializeAttachment() as VisitorAttachment | null | undefined
  if (attachment?.visitorState) {
    peer.context.visitorState = attachment.visitorState
    return attachment.visitorState
  }

  const headers = peer.request.headers
  const visitor = headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers?.get('cf-connecting-ipv6') || headers?.get('cf-connecting-ip') || headers?.get('x-real-ip')
    || peer.remoteAddress || peer.id
  const state = {
    visitor,
    path: normalizeVisitorPath(new URL(peer.request.url).searchParams.get('path')),
  }
  setVisitorState(peer, state)
  return state
}

export function setVisitorState(peer: Peer, state: VisitorState) {
  const socket = getAttachmentSocket(peer)
  if (socket) {
    const attachment = socket.deserializeAttachment() as VisitorAttachment | null
    // Preserve crossws's connection ID, upgrade URL and subscriptions.
    socket.serializeAttachment({ ...attachment, visitorState: state })
  }
  peer.context.visitorState = state
}

function normalizeVisitorPath(path: unknown): string | null {
  const result = visitorPathSchema.safeParse(path)
  return result.success ? result.data : null
}

function getAttachmentSocket(peer: Peer): AttachmentSocket | undefined {
  // crossws 0.3's public websocket is a Proxy. Cloudflare's attachment methods
  // require the underlying native socket as `this`, otherwise they throw.
  const { ws } = Reflect.get(peer, '_internal') as { ws: AttachmentSocket }
  return typeof ws.serializeAttachment === 'function'
    ? ws
    : undefined
}
