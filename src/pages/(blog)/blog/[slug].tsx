import type { PageProps } from '@framework/component'
import { getPost } from '@/lib/post'

export default async function BlogSlug({ params }: PageProps<'blog/[slug]'>) {
  const post = await getPost({
    slug: params.slug,
  })
  if (!post) {
    throw new Error('not found')
  }
  return (
    <div>
      <h1>
        blog/:slug -
        {params.slug}
      </h1>
      <div>
        <pre>{JSON.stringify(post, null, 2)}</pre>
      </div>
    </div>
  )
}
