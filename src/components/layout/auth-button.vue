<script setup lang="tsx">
import { useAuth } from '~/composables/auth'

const { loggedIn, user, signOut } = useAuth()

const authModalRef = useTemplateRef('authModalRef')

function openAuthModal() {
  authModalRef.value?.open()
}

async function handleSignOut() {
  await signOut()
}

function UserIcon() {
  if (!user.value)
    return <span>U</span>
  if (user.value.image) {
    return (
      <img
        alt={user.value.name}
        src={user.value.image}
        class="size-5 rounded-full object-cover"
      />
    )
  }
  return <span>{user.value.name.charAt(0).toUpperCase()}</span>
}
</script>

<template>
  <!-- Auth Modal -->
  <AuthModal ref="authModalRef" />

  <!-- 未登录状态：显示登录按钮 -->
  <button
    v-if="!loggedIn"
    type="button"
    flex="~ items-center justify-center" of-hidden
    class="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
    title="登录"
    @click="openAuthModal"
  >
    <div class="i-mingcute:user-4-line size-4" />
  </button>

  <!-- 已登录状态：显示用户头像  -->
  <button
    v-else
    type="button"
    flex="~ items-center justify-center" of-hidden
    class="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
    @click="handleSignOut"
  >
    <UserIcon />
  </button>
</template>
