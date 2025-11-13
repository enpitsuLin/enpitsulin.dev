export default async function HomePage() {
  return (
    <div>
      index page
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
