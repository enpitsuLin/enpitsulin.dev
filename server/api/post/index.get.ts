import type { ParsedPost } from './[slug].get'

export default eventHandler(async () => {
  const postsKeys = await hubKV().keys('post')
  const posts = await Promise.all(postsKeys.map(async (key) => {
    const slug = key.replace('post:', '')
    const post = await hubKV().get<ParsedPost>(key)!
    return { slug, ...post }
  }))

  return posts
})
