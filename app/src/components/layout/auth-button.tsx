'use client'

import { Menu, Portal } from '@ark-ui/react'
import { useAuthContext } from '@/hooks/auth/context'
import { authClient } from '@/lib/auth/client'
import { AuthModal } from '../auth/modal'
import { UserAvatar } from '../auth/user-avatar'

export function AuthButton() {
  const { user } = useAuthContext()

  if (!user) {
    return (
      <AuthModal>
        <button
          type="button"
          flex="~ items-center justify-center"
          of-hidden
          className="size-8 bg-opacity-80 transition-all active:scale-105 hover:scale-115"
          title="登录"
        >
          <span className="sr-only">登录</span>
          <div className="i-mingcute:user-4-line size-4" />
        </button>
      </AuthModal>
    )
  }

  return (
    <Menu.Root positioning={{ placement: 'left' }}>
      <Menu.Trigger
        type="button"
        flex="~ items-center justify-center"
        size-8
        of-hidden
        p-1
        className="transition-all active:scale-105 hover:scale-115"
      >
        <UserAvatar user={user} />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            min-w-32
            p-2
            border="~ border rounded-lg"
            bg="white/50 dark:zinc-900/50"
            className="shadow-black/10 shadow-md transition-all"
            backdrop-blur
          >
            <div px-1 space-y-1>
              <h4 text-xs op-70>
                账户
              </h4>
              <div flex="~ items-center justify-center gap-1" of-hidden>
                <UserAvatar size-6 user={user} />
                <span flex-1 text-xs>
                  {user?.name}
                </span>
              </div>
            </div>
            <Menu.Separator my-1 border="~ border" />
            {user?.role === 'admin' && (
              <Menu.Item
                value="admin"
                asChild
              >
                <a
                  p="x2 y1.5"
                  flex="~ items-center gap-2"
                  bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
                  cursor-pointer
                  rounded
                  text-xs
                  href="/admin"
                >
                  <div className="i-mingcute:dashboard-2-line size-4" />
                  <span>后台管理</span>
                </a>
              </Menu.Item>
            )}
            <Menu.Item
              value="account"
              p="x2 y1.5"
              flex="~ items-center gap-2"
              bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              cursor-pointer
              rounded
              text-xs
            >
              <div className="i-mingcute:settings-3-line size-4" />
              <span>账户管理</span>
            </Menu.Item>
            <Menu.Item
              value="signout"
              p="x2 y1.5"
              flex="~ items-center gap-2"
              bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              cursor-pointer
              rounded
              text-xs
              onClick={() => {
                authClient.signOut()
              }}
            >
              <div className="i-mingcute:exit-line size-4" />
              <span>退出登录</span>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
