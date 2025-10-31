<script setup lang="ts">
import { useAuth } from '~/composables/auth'

const { user } = useAuth()
const router = useRouter()
const route = useRoute()

if (user.value?.role !== 'admin' && route.path !== '/dashboard/sign-in') {
  await router.push({
    path: '/dashboard/sign-in',
    query: {
      redirect: encodeURIComponent(route.fullPath),
    },
  })
}
</script>

<template>
  <div>
    <h1>[admin layout]</h1>
    <main relative mt-16 w="full" px="8 sm:12">
      <RouterView />
    </main>
  </div>
</template>

<route lang="yaml">
meta:
  requireAuth: 'admin'
</route>
