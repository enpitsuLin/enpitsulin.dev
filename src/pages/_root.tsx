import { GlobalProvider } from '@/components/global-provider'
import { ThemeScript } from '@/hooks/theme/script'
import { getSession } from '@/lib/auth/server-utils'
import { description, title } from '@/lib/constants'
import 'uno.css'
import '@unocss/reset/tailwind.css'
import '@/styles/main.css'

export default async function Root({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  return (
    <GlobalProvider session={session.session} user={session.user}>
      <html suppressHydrationWarning={true} lang="zh-Hans">
        <head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="keywords" content="enpitsulin, blog, portfolio" />
          <meta name="author" content="enpitsulin" />
          <link rel="icon" type="image/png" href="/images/favicon.png" />
          <ThemeScript />
        </head>
        <body
          data-version="1.0"
          className="text-gray-950 dark:text-gray-50 bg-slate-50 dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#e5e7eb20_1px,transparent_1px)]"
        >
          {children}
          <pre>
            {JSON.stringify(session, null, 2)}
          </pre>
        </body>
      </html>
    </GlobalProvider>
  )
}
