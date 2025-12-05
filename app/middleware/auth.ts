export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user } = useUserSession()
  if (!loggedIn.value || user.value?.role !== 'admin') {
    return navigateTo({
      path: '/admin/sign-in',
      query: { redirect: to.path },
    })
  }
})
