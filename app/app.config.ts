const siteUrl = 'https://enpitsulin.dev'

export default defineAppConfig({
  siteUrl,
  title: 'Promise { <pending> }',
  description: 'What are you looking for?',
  defaultOgImage: new URL('/placeholder-social.png', siteUrl).href,
  navigation: [
    {
      label: '首页',
      href: '/',
    },
    {
      label: '文章',
      href: '/blog',
    },
    {
      label: '项目',
      href: '/projects',
    },
    {
      label: '留言墙',
      href: '/guestbook',
    },
    {
      label: '关于',
      href: '/about',
    },
  ],
})
