'use server'

import type { Session, User } from '@/auth'
import { unstable_getHeaders as getHeaders } from 'waku/server'
import { auth } from '@/auth'

export async function getSession(): Promise<{ session: Session | null, user: User | null }> {
  const headers = new Headers(getHeaders())
  const session = await auth.api.getSession({ headers })
  if (!session)
    return { session: null, user: null }
  return { session: session.session as Session, user: session.user as User }
}
