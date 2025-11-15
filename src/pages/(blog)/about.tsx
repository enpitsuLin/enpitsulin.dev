export default async function AboutPage() {
  const data = await getData()

  return (
    <div>
      <title>{data.title}</title>
      <h1 className="text-4xl font-bold tracking-tight">{data.headline}</h1>
      <p>{data.body}</p>
      <a href="/" className="mt-4 inline-block underline">
        Return home
      </a>
    </div>
  )
}

async function getData() {
  const data = {
    title: 'About',
    headline: 'About Waku',
    body: 'The minimal React framework',
  }

  return data
}
