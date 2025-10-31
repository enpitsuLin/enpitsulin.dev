import { createApp } from '~/main'

import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

createApp().then(async ({ app, router, hooks }) => {
  hooks.hook('vue:error', (err, _instance, _info) => {
    console.error(err)
  })
  await hooks.callHook('app:created', app)
  await router.isReady()
  await hooks.callHook('app:beforeMount', app)
  app.mount('#app')
  await hooks.callHook('app:mounted', app)
})
