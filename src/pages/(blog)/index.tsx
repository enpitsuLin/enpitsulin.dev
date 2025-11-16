import { RecentArticles } from '@/components/article/recent-articles'
import { Intro } from '@/components/home/intro'
import { StackMarquee } from '@/components/home/stack-marquee'

export default async function HomePage() {
  return (
    <div>
      <Intro />
      <RecentArticles />
      <StackMarquee />
    </div>
  )
}
