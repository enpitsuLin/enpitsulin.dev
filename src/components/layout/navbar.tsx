'use client'

import type { DialogOpenChangeDetails } from '@ark-ui/react/dialog'
import { Dialog } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import { useRouter } from '@framework/router/client'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { navigation } from '@/lib/constants'

export function Navbar() {
  const router = useRouter()
  const path = router.route.path
  return (
    <header
      flex="~ items-center justify-between md:justify-center"
      sticky
      top-0
      z-99
      w="full"
      px-8
      pt-5
    >
      <div pointer-events-none fixed left-0 right-0 top-0 h-25 select-none className="navbar-blur" />

      <div
        relative
        z-2
        h="full"
        w="fit"
        className="transform animate-duration-1300 animate-ease-$spring-easing animate-in slide-in-from-top-70px"
      >
        <div
          position="sticky top-4 md:absolute md:top-1/2 md:left--12"
          md:translate-y="-1/2"
        >
          {path !== '/' && (
            <motion.img
              layoutId="avatar"
              alt="avatar"
              width="250"
              height="250"
              decoding="async"
              className="size-9 border-2 border-white rounded-full object-cover shadow-xl"
              src="https://avatars.githubusercontent.com/enpitsuLin"
            />
          )}
        </div>
        <nav
          bg="zinc-50/50 dark:zinc-950/50"
          px-8
          py="2"
          border="~ border rounded-full"
          className="hidden shadow-black/10 shadow-md backdrop-blur-0.5rem transition-background-color md:flex"
        >
          <ul
            flex="~ items-center justify-center gap-2"
            className="text-0.9rem text-gray-500 font-medium"
          >
            {navigation.map(({ href, label }) => (
              <li
                key={href}
                relative
                flex="~ items-center justify-center"
                className="h-7 break-keep"
              >
                <a
                  data-active={path === href ? 'true' : 'false'}
                  flex="~ items-center justify-center"
                  h="full"
                  w="full"
                  un-text="data-[active=true]:zinc-200 dark:data-[active=true]:zinc-800 zinc-800 dark:zinc-200 op-70 data-[active=true]:op-100 hover:op-100"
                  className="navbar-link relative transition-color"
                  cursor-pointer
                  px-3
                  href={href}
                >
                  {path === href && (
                    <motion.div
                      // workaround https://github.com/motiondivision/motion/issues/1535
                      style={{ originY: 'top' }}
                      layoutId="navbar-link"
                      bg="zinc-800 dark:zinc-200"
                      className="absolute inset-0 rounded-full shadow-md"
                    />
                  )}
                  <span relative>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <NavbarMenu />
    </header>
  )
}

export function NavbarMenu() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [open, setOpen] = useState(isMobile)

  function handleOpenChange(details: DialogOpenChangeDetails) {
    setOpen(details.open)
  }

  if (!isMobile)
    return null

  return (
    <div
      relative
      ml-auto
      className="transform animate-duration-1300 animate-ease-$spring-easing animate-in slide-in-from-top-70px md:hidden"
    >
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger
          bg="zinc-50/50 dark:zinc-950/50"
          px-4
          py="2"
          flex="inline items-center gap-1"
          border="~ border rounded-full"
          outline-none
          className="shadow-black/10 shadow-md backdrop-blur-0.5rem transition-background-color"
        >
          前往
          <div className="i-mingcute:down-line size-4" />
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop
            bg="zinc-800/40 dark:bg-black/40"
            className="fixed inset-0 z-99 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          />
          <Dialog.Positioner>
            <Dialog.Content
              className="fixed inset-x-4 top-8 z-100 origin-top rounded-3xl from-zinc-100/75 to-white bg-gradient-to-b p-8 ring-1 ring-zinc-900/5 dark:from-zinc-900/50 dark:to-zinc-900 dark:ring-zinc-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
            >
              <div flex="~ row-reverse items-center justify-between">
                <Dialog.CloseTrigger>
                  <div className="i-mingcute:close-line size-4" />
                </Dialog.CloseTrigger>
                <h2 un-text="sm font-medium zinc-600 dark:zinc-400">
                  站内导航
                </h2>
              </div>
              <nav mt-6>
                <ul
                  text="base zinc-800 dark:zinc-300"
                  className="-my-2 divide-y divide-zinc-500/20 dark:divide-zinc-100/5"
                >
                  {navigation.map(({ href, label }) => (
                    <li key={href}>
                      <Dialog.CloseTrigger asChild>
                        <a href={href} block py-2>
                          {label}
                        </a>
                      </Dialog.CloseTrigger>
                    </li>
                  ))}

                </ul>
              </nav>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>
  )
}
