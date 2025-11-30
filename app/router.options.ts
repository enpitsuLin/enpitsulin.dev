// @unocss-include
import type { RouterConfig } from '@nuxt/schema'

export default {
  // https://router.vuejs.org/api/interfaces/routeroptions#routes
  routes: (_routes) => {
    return [
      {
        name: '(home)',
        path: '/',
        component: () => import('~/components/layouts/home.vue'),
        children: [
          {
            name: 'index',
            path: '/',
            component: () => import('~/pages/(home)/index.vue'),
          },
          {
            name: 'blog',
            path: '/blog',
            children: [
              {
                name: 'blog-index',
                path: '/blog',
                component: () => import('~/pages/(home)/blog/index.vue'),
              },
              {
                name: 'blog-slug',
                path: '/blog/:slug',
                component: () => import('~/pages/(home)/blog/[slug].vue'),
              },
              {
                name: 'blog-tag-tag',
                path: '/blog/tag/:tag',
                component: () => import('~/pages/(home)/blog/tag/[tag].vue'),
              },
            ],
          },
          {
            name: 'projects',
            path: '/projects',
            component: () => import('~/pages/(home)/projects.vue'),
          },
          {
            name: 'guestbook',
            path: '/guestbook',
            component: () => import('~/pages/(home)/guestbook.vue'),
          },
          {
            name: 'about',
            path: '/about',
            component: () => import('~/pages/(home)/about.vue'),
          },
          {
            name: 'not-found',
            path: '/:pathMatch(.*)*',
            component: () => import('~/pages/(home)/[...not-found].vue'),
          },
        ],
      },
      {
        name: 'admin',
        path: '/admin',
        meta: {
          breadcrumb: '仪表盘',
        },
        component: () => import('~/components/layouts/dashboard.vue'),
        children: [
          {
            name: '(dashboard)',
            path: '/admin',
            component: () => import('~/pages/admin/(dashboard)/index.vue'),
            meta: {
              title: '仪表盘',
              breadcrumb: '仪表盘',
              icon: 'i-mingcute:dashboard-line',
            },
          },
          {
            name: 'posts',
            path: '/admin/posts',
            meta: {
              title: '文章管理',
              breadcrumb: '文章管理',
              icon: 'i-mingcute:code-line',
            },
            children: [
              {
                name: 'posts-id',
                path: '/admin/posts/:id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})',
                component: () => import('~/pages/admin/(dashboard)/posts/[id].vue'),
                meta: {
                  breadcrumb: '编辑',
                  hideInSidebar: true,
                },
              },
              {
                name: 'posts-index',
                path: '/admin/posts/:page(\\d+)?',
                component: () => import('~/pages/admin/(dashboard)/posts/[[page]].vue'),
                meta: {
                  title: '管理',
                  breadcrumb: '管理',
                  to: '/admin/posts',
                  icon: 'i-mingcute:list-check-3-line',
                },
              },
              {
                name: 'posts-create',
                path: '/admin/posts/create',
                component: () => import('~/pages/admin/(dashboard)/posts/create.vue'),
                meta: {
                  title: '新建',
                  breadcrumb: '新建',
                  icon: 'i-mingcute:add-line',
                },
              },
            ],
          },
          {
            name: 'admin-not-found',
            path: '/admin/:pathMatch(.*)*',
            component: () => import('~/pages/admin/(dashboard)/[...not-found].vue'),
            meta: {
              breadcrumb: '404',
            },
          },
        ],
      },
      {
        name: 'admin-sign-in',
        path: '/admin/sign-in',
        component: () => import('~/pages/admin/sign-in.vue'),
      },
    ]
  },
} satisfies RouterConfig
