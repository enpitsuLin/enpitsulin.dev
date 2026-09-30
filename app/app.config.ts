// @unocss-include
import type { RouteMap } from 'vue-router'

interface NavigationItem {
  label: string
  href: string
  match: (keyof RouteMap)[]
}

export default defineAppConfig({
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
      label: '想法',
      href: '/sparks',
      match: ['sparks'],
    },
    {
      label: '关于',
      href: '/about',
      match: ['about'],
    },
  ] as NavigationItem[],
})
