'use client'

import { Portal } from '@ark-ui/react'
import { Dialog } from '@ark-ui/react/dialog'
import { useState } from 'react'
import { SignInForm } from './signin-form'
import { SignUpForm } from './signup-form'

export function AuthModal({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop
          bg="zinc-800/40 dark:bg-black/40"
          className="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        />
        <Dialog.Positioner
          fixed
          className="left-1/2 top-4 z-$z-index sm:top-8 -translate-x-1/2"
        >
          <Dialog.Content
            p="6 sm:p-8"
            w="[calc(100vw-2rem)]"
            relative
            max-w-sm
            of-hidden
            border="~ border rounded-xl md:rounded-3xl"
            bg="white/95 dark:zinc-900/95"
            text="zinc-900 dark:white"
            className="z-100 origin-center backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
          >
            {/* <!-- Header with Avatar and Title --> */}
            <div mb="8" space-y-2>
              {/* <!-- Title --> */}
              <h2 un-text="2xl font-bold zinc-900 dark:white mb-2">
                {isSignUp ? '注册' : '登录'}
              </h2>

              {/* <!-- Subtitle --> */}
              <p un-text="xs zinc-500 dark:text-zinc-400">
                {isSignUp ? '创建新账户开始使用' : '继续使用 enpitsulin.dev'}
              </p>
            </div>
            {/* <!-- Close Button --> */}
            <Dialog.CloseTrigger
              absolute
              rounded-lg
              p-2
              bg="transparent hover:zinc-200/50 dark:hover:zinc-700/50"
              className="top-4 right-4 transition-colors"
            >
              <div className="i-mingcute:close-line size-4 text-zinc-500 dark:text-zinc-400" />
            </Dialog.CloseTrigger>
            {/* <!-- Form --> */}
            <div mt-6>
              <div space-y-2>
                TODO social sign in
              </div>
              {/* <!-- Divider --> */}
              <div flex="~ items-center gap-3" py="4">
                <div flex="1" h="1px" bg="border" />
                <span text="xs text-zinc-500 dark:text-zinc-400">或者</span>
                <div flex="1" h="1px" bg="border" />
              </div>
              {isSignUp ? <SignUpForm /> : <SignInForm />}
            </div>
            {/* <!-- Toggle mode --> */}
            <div mt-3 text="center">
              <span un-text="xs text-zinc-500 dark:text-zinc-400">
                {isSignUp ? '已有账户？' : '还没有账户？'}
              </span>
              <button
                text="xs zinc-700 dark:white underline hover:blue-600 dark:hover:blue-400"
                className="ml-1 underline transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? '登录' : '注册'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
