export default defineNuxtPlugin({
  name: 'auth',
  setup() {
    const { user } = useUserSession()
    return {
      provide: {
        user: user.value,
      },
    }
  },
})
