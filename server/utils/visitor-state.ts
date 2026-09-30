import type { Peer } from 'crossws'
import { z } from 'zod'
import { visitorPathSchema } from '#shared/schemas/visitors'

const visitorStateSchema = z.object({
  visitor: z.string(),
  path: visitorPathSchema.nullable(),
})
const visitorAttachmentSchema = z.object({ visitorState: visitorStateSchema })

type VisitorState = z.infer<typeof visitorStateSchema>

type AttachmentSocket = Pick<WebSocket, 'serializeAttachment' | 'deserializeAttachment'>

export function getVisitorState(peer: Peer): VisitorState {
  const cached = visitorStateSchema.safeParse(peer.context.visitorState)
  if (cached.success)
    return cached.data

  const attachment = visitorAttachmentSchema.safeParse(getAttachmentSocket(peer)?.deserializeAttachment())
  if (attachment.success) {
    peer.context.visitorState = attachment.data.visitorState
    return attachment.data.visitorState
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
    const attachment: unknown = socket.deserializeAttachment()
    // Preserve crossws's connection ID, upgrade URL and subscriptions.
    socket.serializeAttachment({ ...(isRecord(attachment) ? attachment : {}), visitorState: state })
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
  const internal: unknown = Reflect.get(peer, '_internal')
  if (!isRecord(internal))
    return

  const socket = internal.ws
  if (isAttachmentSocket(socket))
    return socket
}

function isAttachmentSocket(value: unknown): value is AttachmentSocket {
  return isRecord(value) && typeof value.serializeAttachment === 'function' && typeof value.deserializeAttachment === 'function'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
