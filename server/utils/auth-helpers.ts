import type { H3Event } from 'h3'
import { createError } from 'h3'

/**
 * Get current user from auth session
 */
export async function getCurrentUser(event: H3Event) {
  const session = await event.context.auth.api.getSession({
    headers: event.headers,
  })

  return session?.user || null
}

/**
 * Assert that the current user is an admin
 * Throws 401 error if not authenticated, 403 if not admin
 */
export async function assertAdmin(event: H3Event) {
  const user = await getCurrentUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required',
    })
  }

  return user
}
