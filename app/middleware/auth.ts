export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo({
      path: '/admin/sign-in',
      query: { redirect: to.path },
    })
  }
})
