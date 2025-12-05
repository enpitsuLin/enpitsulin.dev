// @unocss-include
import type { RouteMap } from 'vue-router'

const siteUrl = 'https://enpitsulin.dev'

interface NavigationItem {
  label: string
  href: string
  match: (keyof RouteMap)[]
}

interface AdminNavigationItem {
  label: string
  href: string
  icon: string
  match: (keyof RouteMap)[]
  children: AdminNavigationItem[]
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
      label: '想法',
      href: '/thoughts',
      match: ['thoughts'],
    },
  ] as NavigationItem[],

  adminNavigation: [
    {
      label: '仪表盘',
      href: '/admin',
      match: ['admin'],
      icon: 'i-mingcute:dashboard-line',
    },
    {
      label: '文章管理',
      href: '/admin/posts',
      match: ['admin-posts-page', 'admin-posts-create', 'admin-posts-id'],
      icon: 'i-mingcute:code-line',
      children: [
        {
          label: '文章列表',
          href: '/admin/posts',
          match: ['admin-posts-page'],
          icon: 'i-mingcute:list-check-3-line',
        },
        {
          label: '新建文章',
          href: '/admin/posts/create',
          match: ['admin-posts-create'],
          icon: 'i-mingcute:add-line',
        },
      ],
    },
    {
      label: '想法管理',
      href: '/admin/thoughts/create',
      match: ['admin-thoughts-create'],
      icon: 'i-mingcute:lightbulb-line',
      children: [
        {
          label: '新建想法',
          href: '/admin/thoughts/create',
          match: ['admin-thoughts-create'],
          icon: 'i-mingcute:add-line',
        },
      ],
    },
  ] as AdminNavigationItem[],
})
