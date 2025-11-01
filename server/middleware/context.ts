import type { Session, User } from '~~/lib/auth'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { auth } from '~~/lib/auth'

export interface Env {
  Bindings: Cloudflare.Env
  Variables: {
    auth: {
      session: Session | null
      user: User | null
      assertAuth: (role: 'admin' | 'user') => void
    }
  }
}

export const middleware = createMiddleware<Env>(async (c, next) => {
  const authContext: Env['Variables']['auth'] = {
    session: null,
    user: null,
    assertAuth: (role: 'admin' | 'user') => {
      const auth = c.get('auth')
      if (!auth.user) {
        throw new HTTPException(401, { message: 'Unauthorized' })
      }
      if (auth.user.role && auth.user.role !== role) {
        throw new HTTPException(403, { message: 'Forbidden: You are not authorized to access this resource' })
      }
    },
  }

  try {
    const session = await auth.api.getSession(c.req.raw)

    if (session) {
      authContext.session = session?.session ?? null
      authContext.user = session?.user ?? null
    }
  }
  catch (error) {
    console.error(error)
    throw new HTTPException(500, { message: 'Internal server error' })
  }

  c.set('auth', authContext)

  await next()
})
