import type { UserModule } from '~/types'
import NProgress from 'nprogress'

export const install: UserModule = ({ router }) => {
  if (!import.meta.env.SSR) {
    router.beforeEach((to, from) => {
      if (to.path !== from.path)
        NProgress.start()
    })
    router.afterEach(() => {
      NProgress.done()
    })
  }
}
