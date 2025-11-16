import type { PageProps } from '@framework/component'

export default async function BlogSlug({ params }: PageProps<'blog/[slug]'>) {
  return (
    <div>
      <h1>
        blog/:slug -
        {params.slug}
      </h1>
    </div>
  )
}
