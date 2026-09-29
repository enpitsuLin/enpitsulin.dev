import { env } from 'cloudflare:workers'
import mime from 'mime'

export default eventHandler(async (event) => {
  const { pathname } = event.context.params || {}
  if (!pathname) {
    throw createError({
      status: 400,
      message: 'Invalid path',
    })
  }

  const object = await env.BLOB.get(decodeURIComponent(pathname))
  if (!object) {
    throw createError({
      status: 404,
      message: 'Asset not found',
    })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('content-length', object.size.toString())
  headers.set('content-type', object.httpMetadata?.contentType || mime.getType(pathname) || 'application/octet-stream')
  headers.set('etag', object.httpEtag)

  return new Response(object.body, { headers })
})
