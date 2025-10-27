import { createEApp } from '~~/lib/application'
import { createApp } from '~/main'

createApp().then(({ app, router, initialState }) => {
  router.isReady().then(() => {
    createEApp({ vueApp: app, initialState })
    app.mount('#app')
  })
})
