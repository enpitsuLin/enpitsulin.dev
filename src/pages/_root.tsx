import 'uno.css'
import '@unocss/reset/tailwind.css'
import '@/styles/main.css'

export default async function RootElement({ children }: { children: React.ReactNode }) {
  const data = await getData()

  return (
    <html suppressHydrationWarning={true} lang="zh-Hans">
      <head>
        <meta name="description" content={data.description} />
        <link rel="icon" type="image/png" href={data.icon} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          precedence="font"
        />
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

async function getData() {
  const data = {
    description: 'An internet website!',
    icon: '/images/favicon.png',
  }

  return data
}

export async function getConfig() {
  return {
    render: 'static',
  } as const
}
