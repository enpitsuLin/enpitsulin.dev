import { Intro } from '@/components/home/intro'
import { StackMarquee } from '@/components/home/stack-marquee'

export default async function HomePage() {
  return (
    <div>
      <Intro />
      <StackMarquee />
      <div className="h-100vh"></div>
    </div>
  )
}
