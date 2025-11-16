import type { SelectPost } from '@database/schema'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export function ArticleTitle({ article }: { article: SelectPost }) {
  return (
    <h2 className="text-base tracking-tight text-zinc-800 dark:text-zinc-100">
      <div className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-800/50 sm:-inset-x-6 sm:rounded-2xl" />
      <a href={`/blog/${article.slug}`}>
        <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
        <span className="relative z-10">{article.title ?? 'Untitled Post'}</span>
      </a>
    </h2>
  )
}

export function ArticleTime({ article, className }: { article: SelectPost, className?: string }) {
  const date = format(article.publishedAt, 'yyyy MMM dd', { locale: zhCN })
  return (
    <time
      className={cn(
        'relative z-10 order-first mb-3 flex items-center pl-3.5 text-sm text-zinc-500 dark:text-zinc-500',
        className,
      )}
      dateTime={article.publishedAt?.toISOString()}
    >
      <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
        <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
      </span>
      {date}
    </time>
  )
}

export function ArticleTag(props: {
  tag: string
  className?: string
}) {
  return (
    <a
      href={`/blog/tags/${props.tag}`}
      className={cn(
        'rounded-md px-2 py-1 text-sm',
        'bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-200 dark:bg-zinc-700/50 dark:hover:bg-zinc-700 dark:active:bg-zinc-700/50',
        'text-zinc-900 outline-offset-2 transition active:text-zinc-900/60 active:transition-none dark:text-zinc-400 dark:hover:text-zinc-100 dark:active:text-zinc-100/70',
        props.className,
      )}
    >
      <span>{props.tag}</span>
    </a>
  )
}
