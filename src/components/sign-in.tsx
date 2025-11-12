'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function SignIn() {
  const [email, setEmail] = useState('enpitsulin@gmail.com')
  const [password, setPassword] = useState('12341234')

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: (_ctx) => {
          // show loading state
        },
        onSuccess: (_ctx) => {
          // redirect to home
        },
        onError: (ctx) => {
          console.error(ctx.error)
        },
      },
    )
  }

  return (
    <div>
      <h2>
        Sign In
      </h2>
      <form onSubmit={signIn}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}
