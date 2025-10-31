<script setup lang="ts">
import { useAuth } from '~/composables/auth'

defineOptions({
  name: 'DashboardLayout',
})

const { user } = useAuth()
const router = useRouter()
const route = useRoute()

if (user.value?.role !== 'admin') {
  await router.push({
    path: '/admin/sign-in',
    query: {
      redirect: encodeURIComponent(route.fullPath),
    },
  })
}
</script>

<template>
  <h2>[/admin/dashboard] layout</h2>
  <RouterView />
</template>
