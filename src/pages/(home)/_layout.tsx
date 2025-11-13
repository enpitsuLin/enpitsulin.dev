import type { ReactNode } from 'react'

import { Fab } from '@/components/layout/fab'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

interface RootLayoutProps { children: ReactNode }

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div relative px="sm:8" flex="~ justify-center" min-h-screen>
        <div
          flex="~ 1 col items-center"
          px="lg:8"
          w="full"
          bg="zinc-50 dark:zinc-900"
          relative
          max-w-6xl
          shadow-lg
          className="ring-1 ring-zinc-100 dark:ring-zinc-300/20"
        >
          <Navbar />
          <main relative mt-16 w="full" px="8 sm:12">
            {children}
          </main>
          <div mt-auto aria-hidden="true" />
          <Footer />
        </div>
      </div>
      <Fab />
    </>
  )
}

export async function getConfig() {
  return {
    render: 'static',
  } as const
}
