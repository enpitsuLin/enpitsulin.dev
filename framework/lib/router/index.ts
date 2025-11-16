import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { createError } from '../custom-error'

export function redirect(location: string, status: ContentfulStatusCode): never {
  throw createError('Redirect', { status, location })
}

export function notFound(status: ContentfulStatusCode = 404): never {
  throw createError('Not found', { status })
}
