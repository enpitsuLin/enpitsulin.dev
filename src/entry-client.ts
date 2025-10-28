import { createApp } from '~/main'

createApp().then(async ({ app, router, hooks }) => {
  await hooks.callHook('app:created', app)
  await router.isReady()
  await hooks.callHook('app:beforeMount', app)
  app.mount('#app')
  await hooks.callHook('app:mounted', app)
})
