'use client'

import type { Post } from '@/lib/post'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

import { motion } from 'motion/react'
import { ArticleTag, ArticleTime, ArticleTitle } from '@/components/article/article-items'

interface Props {
  article: Post
}

export function Article({ article }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid md:grid-cols-4 md:items-baseline"
    >
      <div className="group relative flex flex-col items-start md:col-span-3">
        <ArticleTitle article={article} />
        <ArticleTime article={article} className="md:hidden" />
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
      </div>
      <div className="relative z-10 order-first hidden flex-col items-start md:flex">
        <time
          className="mb-3 mt-1 text-sm text-zinc-500 dark:text-zinc-500"
          dateTime={article.publishedAt?.toISOString()}
        >
          {format(article.publishedAt, 'MMM dd yyyy', { locale: zhCN })}
        </time>
        <div className="flex flex-wrap gap-1 pr-10">
          {article.tags?.map(tag => (
            <ArticleTag key={tag} tag={tag} className="text-xs" />
          ))}
        </div>
      </div>
    </motion.article>
  )
}
