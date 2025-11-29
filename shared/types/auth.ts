import type { InferSessionFromClient, InferUserFromClient } from 'better-auth'
import type { baseClientOptions } from '../auth-options'

export type User = InferUserFromClient<typeof baseClientOptions>
export type Session = InferSessionFromClient<typeof baseClientOptions>
