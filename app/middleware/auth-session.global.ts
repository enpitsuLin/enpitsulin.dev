import type { RouteMeta } from 'vue-router'
import { defineNuxtRouteMiddleware } from '#app'
import { defu } from 'defu'
import { useAuthSession } from '~/composables/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const meta = defu<RouteMeta, [Required<Pick<RouteMeta, 'requireAuth'>>]>(to.meta, {
    requireAuth: true,
  })
  // If auth is disabled, skip middleware
  if (!meta.requiresAuth) {
    return
  }

  const { fetchSession } = useAuthSession()

  await fetchSession()
})
