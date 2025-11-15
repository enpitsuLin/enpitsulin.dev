import type { RootComponent } from '@framework/component'
import { getContext } from '@framework/server'
import { GlobalProvider } from '@/components/global-provider'
import { ThemeScript } from '@/hooks/theme/script'
import { getSession } from '@/lib/auth/server-utils'
import { description, title } from '@/lib/constants'
import '@/styles/main.css'
import '@unocss/reset/tailwind.css'
import 'uno.css'

const Root: RootComponent = async ({ children }) => {
  const session = await getSession()
  const ctx = getContext()
  const matchRoute = ctx.var.route?.matchedPath || '/'
  const params = ctx.var.route?.params || {}
  const routes = ctx.var.routes.map(route => ({ path: route.path, params: route.params }))

  return (
    <GlobalProvider
      session={session.session}
      user={session.user}
      routes={routes}
      params={params}
      path={matchRoute}
    >
      <html suppressHydrationWarning={true} lang="zh-Hans">
        <head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="keywords" content="enpitsulin, blog, portfolio" />
          <meta name="author" content="enpitsulin" />
          <link rel="icon" type="image/png" href="/images/favicon.png" />
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
          <ThemeScript />
        </head>
        <body
          data-version="1.0"
          className="text-gray-950 dark:text-gray-50 bg-slate-50 dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#e5e7eb20_1px,transparent_1px)]"
        >
          {children}
        </body>
      </html>
    </GlobalProvider>
  )
}

export default Root
