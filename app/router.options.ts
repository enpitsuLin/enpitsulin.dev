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
        ],
      },
      {
        name: '(admin)',
        path: '/admin',
        component: () => import('~/components/layouts/dashboard.vue'),
        children: [
          {
            name: 'dashboard',
            path: '/dashboard',
            component: () => import('~/pages/admin/(dashboard)/index.vue'),
          },
        ],
      },
    ]
  },
} satisfies RouterConfig
