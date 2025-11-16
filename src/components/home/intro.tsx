import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { IntroAvatar } from './avatar'
import { IntroScrollIndicator } from './scroll-indicator'

const links = [
  {
    name: 'Email',
    href: 'mailto://enpitsulin@gmail.com',
    icon: 'i-mingcute:mail-line',
    class: 'bg-#c45040',
  },
  {
    name: 'Twitter: @enpitsulin',
    href: 'https://twitter.com/enpitsulin',
    icon: 'i-mingcute:twitter-line',
    class: 'bg-#4d9feb',
  },
  {
    name: 'Github: enpitsulin',
    href: 'https://github.com/enpitsulin',
    icon: 'i-mingcute:github-line',
    class: 'bg-black',
  },
  {
    name: 'Mastodon: enpitsulin@m.cmx.im',
    href: 'https://elk.zone/m.cmx.im/@enpitsulin',
    icon: 'i-mingcute:mastodon-fill',
    class: 'bg-#479fd1',
  },
  {
    name: 'Bilibili',
    href: 'https://space.bilibili.com/423632',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.172 2.757L10.414 6h3.171l3.243-3.242a1 1 0 1 1 1.415 1.415L16.414 6H18.5A3.5 3.5 0 0 1 22 9.5v8a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 2 17.5v-8A3.5 3.5 0 0 1 5.5 6h2.085L5.757 4.171a1 1 0 0 1 1.415-1.415M18.5 8h-13a1.5 1.5 0 0 0-1.493 1.356L4 9.5v8a1.5 1.5 0 0 0 1.356 1.493L5.5 19h13a1.5 1.5 0 0 0 1.493-1.355L20 17.5v-8A1.5 1.5 0 0 0 18.5 8M8 11a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1" /></svg>,
    class: 'bg-#e479b4',
  },
  {
    name: 'RSS',
    href: '/feed.xml',
    icon: 'i-mingcute:rss-line',
    class: 'bg-#f2a93b',
  },
]

export function Intro() {
  return (
    <section w="full" flex="~ col items-center" className="mb-10 sm:mb-0">
      <div flex="~ col-reverse md:row md:justify-between gap-8" className="w-full md:my-16">
        <div
          flex="~ col gap-4"
          className="[will-change:transform,opacity]"
        >
          <h1 text-2xl>
            Hi, 这里是
            {' '}
            <ruby>
              enpitsu
              <rp>(</rp>
              <rt>えんぴつ</rt>
              <rp>)</rp>
              lin
            </ruby>
            。
          </h1>
          <p className="text-lg sm:text-2xl">
            是一位普通的
            {' '}
            <code className="whitespace-nowrap font-mono">&lt;Developer /&gt;</code>
            。
          </p>
          <p text-sm op-60>
            每天随心所欲充满激情还有带着 🧡 地写代码.
          </p>
          <div mt-4>
            <ul flex="~ gap-2">
              {links.map(link => (
                <li key={link.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        flex="~ items-center justify-center"
                        inline-block
                        aspect-square
                        size-9
                        rounded-full
                        text-white
                        rel="noreferrer"
                        href={link.href}
                        className={cn('group', link.class)}
                      >
                        <span className="sr-only">{link.name }</span>
                        {typeof link.icon === 'string' ? <i inline-block className={cn('transition-transform group-hover:scale-110', link.icon)} /> : link.icon}
                      </a>
                    </TooltipTrigger>

                    <TooltipContent>
                      {link.name}
                    </TooltipContent>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <IntroAvatar className="size-28 md:size-34" />
      </div>

      <IntroScrollIndicator />
    </section>
  )
}
