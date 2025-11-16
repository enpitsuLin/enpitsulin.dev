import type { SelectPost } from '@database/schema'
import { posts } from '@database/schema'

import { desc } from 'drizzle-orm'
import { ArticleTime, ArticleTitle } from '@/components/article/article-items'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/drizzle'

export async function RecentArticles() {
  const articles: SelectPost[] = await db.query.posts.findMany({
    orderBy: desc(posts.publishedAt),
    limit: 2,
  })
  const recentArticle = articles.slice(0, 2)

  return (
    <section className="flex w-full flex-col items-center pb-10">
      <h1 className="font-fold flex w-full items-center justify-between pb-12 text-3xl tracking-tight text-zinc-700 dark:text-zinc-100 sm:text-4xl">
        最新文章
        <Button asChild className="px-3 py-2">
          <a href="/blog" role="button">
            <span>查看全部</span>
          </a>
        </Button>
      </h1>
      <div grid="~ cols-1 gap-16 md:cols-2" w-full>
        {recentArticle.map(article => (
          <article key={article.slug} className="group relative flex flex-col items-start">
            <ArticleTitle article={article} />
            <ArticleTime article={article} />
            <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {article.excerpt || '这篇文章没有什么好总结的，或者是作者没把总结写好 _(:з」∠)_'}
            </p>
            <div
              aria-hidden="true"
              className="relative z-10 mt-4 flex items-center text-sm font-medium text-accent"
            >
              立即阅读
              <i className="i-[mingcute--right-small-line] ml-1 inline-block size-4" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
