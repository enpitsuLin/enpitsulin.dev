// @unocss-include
import type { RouteMap } from 'vue-router'

const siteUrl = 'https://enpitsulin.dev'

interface NavigationItem {
  label: string
  href: string
  match: (keyof RouteMap)[]
}

export default defineAppConfig({
  siteUrl,
  title: 'Promise { <pending> }',
  description: 'What are you looking for?',
  defaultOgImage: new URL('/placeholder-social.png', siteUrl).href,
  navigation: [
    {
      label: '首页',
      href: '/',
      match: ['index'],
    },
    {
      label: '文章',
      href: '/blog',
      match: ['blog-page', 'blog-tag-tag', 'blog-slug', 'blog-tag-tag-page'],
    },
    {
      label: '关于',
      href: '/about',
      match: ['about'],
    },
  ] as NavigationItem[],
})
