<script setup lang="tsx">
import { Avatar } from '@ark-ui/vue/avatar'
import { Menu } from '@ark-ui/vue/menu'
import { useAuth } from '~/composables/auth'

const { loggedIn, user, signOut } = useAuth()

const authModalRef = useTemplateRef('authModalRef')

function openAuthModal() {
  authModalRef.value?.open()
}

async function handleSignOut() {
  await signOut()
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

  <!-- 已登录状态：显示用户头像菜单  -->
  <Menu.Root
    v-else
    :positioning="{
      placement: 'left',
    }"
  >
    <Menu.Trigger
      type="button"
      flex="~ items-center justify-center"
      size-8 of-hidden p-1
      class="transition-all active:scale-105 hover:scale-115"
    >
      <Avatar.Root of-hidden rounded-full>
        <Avatar.Fallback
          size-full
          flex="inline items-center justify-center"
        >
          {{ user?.name?.charAt(0).toUpperCase() ?? 'U' }}
        </Avatar.Fallback>
        <Avatar.Image :src="user?.image ?? ''" alt="avatar" />
      </Avatar.Root>
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content
        min-w-32 p-2
        border="~ border rounded-lg" bg=" slate-50/40 dark:black/40"
        class="shadow-black/10 shadow-md backdrop-blur-10px transition-all"
      >
        <div px-1 space-y-1>
          <h4 text-xs op-70>
            账户
          </h4>
          <div flex="~ items-center justify-center gap-1" of-hidden>
            <Avatar.Root size-6 of-hidden rounded-full>
              <Avatar.Fallback
                size-full
                flex="inline items-center justify-center"
              >
                {{ user?.name?.charAt(0).toUpperCase() ?? 'U' }}
              </Avatar.Fallback>
              <Avatar.Image :src="user?.image ?? ''" alt="avatar" />
            </Avatar.Root>

            <span flex-1 text-xs>
              {{ user?.name }}
            </span>
          </div>
        </div>
        <Menu.Separator my-1 border="zinc-400 dark:zinc-600" />
        <Menu.Item
          value="signout"
          p="x2 y1.5"
          flex="~ items-center gap-2"
          bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
          cursor-pointer
          rounded text-xs @click="handleSignOut"
        >
          <div class="i-mingcute:exit-line size-4" />
          <span>退出登录</span>
        </Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
</template>
