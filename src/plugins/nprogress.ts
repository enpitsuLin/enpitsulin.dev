import NProgress from 'nprogress'
import { defineZootPlugin } from '~~/lib/app'

export default defineZootPlugin((zootApp) => {
  zootApp.hook('app:mounted', (app) => {
    const router = app.config.globalProperties.$router
    router.beforeEach((to, from) => {
      if (to.path !== from.path)
        NProgress.start()
    })
    router.afterEach(() => {
      NProgress.done()
    })
  })
})
