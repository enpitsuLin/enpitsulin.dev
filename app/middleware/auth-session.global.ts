import type { RouteMeta } from 'vue-router'
import { defineNuxtRouteMiddleware } from '#app'
import { defu } from 'defu'
import { useAuthSession } from '~/composables/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const meta = defu<RouteMeta, [Required<Pick<RouteMeta, 'disabledAuth'>>]>(to.meta, {
    disabledAuth: false,
  })
  // If auth is disabled, skip middleware
  if (meta.disabledAuth) {
    return
  }

  const { fetchSession } = useAuthSession()

  await fetchSession()
})
