'use server'

import type { Session, User } from '@/auth'
import { getContext } from 'hono/context-storage'
import { auth } from '@/auth'

export async function getSession(): Promise<{ session: Session | null, user: User | null }> {
  const ctx = getContext()

  const headers = new Headers(ctx.req.raw.headers)
  const session = await auth.api.getSession({ headers })
  if (!session)
    return { session: null, user: null }
  return { session: session.session as Session, user: session.user as User }
}
