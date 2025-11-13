import { env, waitUntil } from 'cloudflare:workers'
import { Suspense } from 'react'
import { Link } from 'waku'
import SignIn from '@/components/sign-in'
import SignUp from '@/components/sign-up'
import { Counter } from '../components/counter'

export default async function HomePage() {
  const data = await getData()

  // Example: invoking waitUntil() on the Cloudflare executionCtx.
  // https://hono.dev/docs/api/context#executionctx
  waitUntil(
    new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn(
          'Cloudflare waitUntil() promise resolved. The server response does not wait for this.',
        )
        resolve()
      }, 1000)
    }),
  )

  const maxItems = env.MAX_ITEMS

  return (
    <div>
      <title>{data.title}</title>
      <h1 className="text-4xl font-bold tracking-tight">{data.headline}</h1>
      <p>{data.body}</p>
      <p>
        MAX_ITEMS =
        {maxItems}
        .
      </p>
      <Suspense fallback="Pending...">
        <ServerMessage />
      </Suspense>
      <Counter max={maxItems} />
      <SignIn />
      <SignUp />
      <Link to="/about" text-red className="mt-4 inline-block underline">
        About page
      </Link>
    </div>
  )
}

// Example async server component
async function ServerMessage() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return <p>Hello from server!</p>
}

// Example async data fetching
async function getData() {
  const data = {
    title: 'Waku',
    headline: 'Waku',
    body: 'Hello world!',
  }

  return data
}

// Enable dynamic server rendering.
// Static rendering is possible if you want to render at build time.
// The Hono context will not be available.
export async function getConfig() {
  return {
    render: 'dynamic',
  } as const
}
