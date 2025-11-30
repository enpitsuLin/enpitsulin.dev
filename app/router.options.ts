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
        name: '(admin)',
        path: '/admin',
        component: () => import('~/components/layouts/dashboard.vue'),
        children: [
          {
            name: 'dashboard',
            path: '/admin',
            component: () => import('~/pages/admin/(dashboard)/index.vue'),
            meta: {
              breadcrumb: '仪表盘',
            },
          },
          {
            name: 'posts',
            path: '/admin/posts',
            children: [
              {
                name: 'posts-id',
                path: '/admin/posts/:id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})',
                component: () => import('~/pages/admin/(dashboard)/posts/[id].vue'),
                meta: {
                  breadcrumb: '编辑文章',
                },
              },
              {
                name: 'posts-index',
                path: '/admin/posts/:page(\\d+)?',
                component: () => import('~/pages/admin/(dashboard)/posts/[[page]].vue'),
                meta: {
                  breadcrumb: '文章管理',
                },
              },
              {
                name: 'posts-create',
                path: '/admin/posts/create',
                component: () => import('~/pages/admin/(dashboard)/posts/create.vue'),
                meta: {
                  breadcrumb: '新建文章',
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
