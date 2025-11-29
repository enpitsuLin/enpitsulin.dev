import { defineNuxtRouteMiddleware } from '#app'
import { useAuthSession } from '~/composables/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // If auth is disabled, skip middleware
  if (to.meta?.auth === false) {
    return
  }

  const { fetchSession } = useAuthSession()

  await fetchSession()
})
