<script setup lang="tsx">
import { Avatar } from '@ark-ui/vue/avatar'
import { Menu } from '@ark-ui/vue/menu'
import { useAuthSession } from '~/composables/auth'

const { loggedIn, user, signOut } = useAuthSession()

async function handleSignOut() {
  await signOut()
}
</script>

<template>
  <!-- 未登录状态：显示登录按钮 -->
  <AuthModal v-if="!loggedIn" />

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
      class="transition-all group active:scale-105 hover:scale-115"
    >
      <Avatar.Root of-hidden rounded-full>
        <Avatar.Fallback
          size-full
          flex="data-[state=visible]:inline items-center justify-center"
        >
          {{ user?.name?.charAt(0).toUpperCase() ?? 'U' }}
        </Avatar.Fallback>
        <Avatar.Image :src="user?.image ?? ''" alt="avatar" />
      </Avatar.Root>
    </Menu.Trigger>

    <Teleport to="#teleports">
      <Menu.Positioner>
        <Menu.Content
          min-w-32 p-2
          border="~ border rounded-lg"
          bg="white/50 dark:zinc-900/50"
          class="shadow-black/10 shadow-md transition-all"
          backdrop-blur
        >
          <div px-1 space-y-1>
            <h4 text-xs op-70>
              账户
            </h4>
            <div flex="~ items-center justify-center gap-1" of-hidden>
              <Avatar.Root size-6 of-hidden rounded-full>
                <Avatar.Fallback
                  size-full
                  flex="data-[state=visible]:inline items-center justify-center"
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
          <Menu.Separator my-1 border="~ border" />
          <Menu.Item
            v-if="user?.role === 'admin'"
            value="admin"
            as-child
          >
            <RouterLink
              p="x2 y1.5"
              flex="~ items-center gap-2"
              bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              cursor-pointer rounded text-xs
              to="/admin"
            >
              <div class="i-mingcute:dashboard-2-line size-4" />
              <span>后台管理</span>
            </RouterLink>
          </Menu.Item>
          <AuthManageModal>
            <Menu.Item
              value="account"
              p="x2 y1.5"
              flex="~ items-center gap-2"
              bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              cursor-pointer
              rounded text-xs
            >
              <div class="i-mingcute:settings-3-line size-4" />
              <span>账户管理</span>
            </Menu.Item>
          </AuthManageModal>
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
    </Teleport>
  </Menu.Root>
</template>
