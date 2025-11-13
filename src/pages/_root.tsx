import { ThemeScript } from '@/hooks/theme/script'
import { description, title } from '@/lib/constants'
import 'uno.css'
import '@unocss/reset/tailwind.css'
import '@/styles/main.css'

export default async function RootElement({ children }: { children: React.ReactNode }) {
  return (
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
      </body>
    </html>
  )
}

export async function getConfig() {
  return {
    render: 'static',
  } as const
}
