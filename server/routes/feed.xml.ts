import { queryCollection } from '@nuxt/content/server'
import { Feed } from 'feed'

export default defineEventHandler(async (event) => {
  try {
    const posts = await queryCollection(event, 'blog')
      .order('publishedAt', 'DESC')
      .all()

    const { title, description, siteUrl, author } = useAppConfig(event)

    const feed = new Feed({
      title,
      description,
      id: siteUrl,
      link: siteUrl,
      language: 'zh-Hans',
      // image: `${siteUrl}/twitter-card.png`,
      favicon: `${siteUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, enpitsulin`,
      feedLinks: {
        rss2: `${siteUrl}/feed.xml`,
      },
      author,
    })

    posts.forEach((post) => {
      const link = new URL(`/${post.path}`, siteUrl).toString()
      feed.addItem({
        title: post.title ?? 'Untitled Post',
        description: post.description,
        id: link,
        date: new Date(post.publishedAt),
        link,
        author: [author],
        category: post.tags?.map((tag: string) => ({ name: tag })) || [],
      })
    })

    setHeader(event, 'Content-Type', 'text/xml')
    return feed.rss2()
  }
  catch (e) {
    return e
  }
})
