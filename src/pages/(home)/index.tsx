import { Intro } from '@/components/home/intro'

export default async function HomePage() {
  return (
    <div>
      <Intro />
    </div>
  )
}

// Enable dynamic server rendering.
// Static rendering is possible if you want to render at build time.
// The Hono context will not be available.
export async function getConfig() {
  return {
    render: 'dynamic',
  } as const
}
