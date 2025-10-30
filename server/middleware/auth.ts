import type { H3EventContext } from 'h3'
import { defineMiddleware, HTTPError } from 'h3'
import { auth } from '~~/lib/auth'

export default defineMiddleware(async (event, next) => {
  const authContext: H3EventContext['auth'] = {
    assertAuth: (role?: 'user' | 'admin') => {
      if (!event.context.auth.user) {
        throw new HTTPError({
          status: 401,
          message: 'Unauthorized',
        })
      }
      if (role && event.context.auth.user.role !== role) {
        throw new HTTPError({
          status: 403,
          message: `Forbidden: You are not authorized to access this resource`,
        })
      }
    },
    user: null,
    session: null,
  }
  try {
    const session = await auth.api.getSession({
      headers: event.req.headers,
    })

    if (session) {
      authContext.user = session.user ?? null
      authContext.session = session.session ?? null
    }
  }
  catch (error) {
    if (error instanceof HTTPError) {
      throw error
    }
    throw new HTTPError({
      status: 500,
      message: 'Internal server error',
    })
  }

  event.context.auth = authContext

  return next()
})
