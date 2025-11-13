'use client'

import { useState } from 'react'
import { authClient } from '../lib/auth/client'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await authClient.signUp.email(
      {
        email,
        password,
        name,
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
        Sign Up
      </h2>
      <form
        onSubmit={signUp}
      >
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}
