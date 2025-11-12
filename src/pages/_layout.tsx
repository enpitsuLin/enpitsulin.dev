import type { ReactNode } from 'react'

import { Footer } from '../components/footer'
import { Header } from '../components/header'
import 'uno.css'

interface RootLayoutProps { children: ReactNode }

export default async function RootLayout({ children }: RootLayoutProps) {
  return (

    <div className="font-['Nunito']">
      <Header />
      <main className="m-6 flex items-center *:min-h-64 *:min-w-64 lg:m-0 lg:min-h-svh lg:justify-center">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export async function getConfig() {
  return {
    render: 'static',
  } as const
}
