import type { RouteLocationRaw, RouteMap } from 'vue-router'

export const siteUrl = 'https://enpitsulin.dev'

export const title = 'Promise { <pending> }'
export const description = 'What are you looking for?'
export const defaultOgImage = new URL('/placeholder-social.png', siteUrl).href
interface NavigationItem {
  label: string
  href: RouteLocationRaw
  match: (keyof RouteMap)[]
}
export const navigation: NavigationItem[] = [
  {
    label: '首页',
    href: '/',
    match: ['/(home)', '/(home)/'],
  },
  {
    label: '文章',
    href: '/blog',
    match: ['/(home)/blog/[[page]]', '/(home)/blog/[slug]', '/(home)/blog/tags/[tag]'],
  },
  {
    label: '项目',
    href: '/projects',
    match: ['/(home)/projects'],
  },
  {
    label: '留言墙',
    href: '/guestbook',
    match: ['/(home)/guestbook'],
  },
  {
    label: '关于',
    href: '/about',
    match: ['/(home)/about'],
  },
]
