import { navigation } from '@/lib/constants'

export function Footer() {
  return (
    <footer px="8 sm:12" border="t border" mt-50 w="full" pb-20 pt-10>
      <div flex="~ col items-center justify-between gap-6 sm:row">
        <div className="flex gap-6 text-sm text-zinc-800 font-medium dark:text-zinc-200">
          {navigation.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="transition hover:text-accent/80 dark:hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          - enpitsulin
        </p>
      </div>
    </footer>
  )
}
