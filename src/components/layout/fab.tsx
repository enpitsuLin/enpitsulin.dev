import { ThemeToggle } from './theme-toggle'
import { ToTopButton } from './to-top-button'

export function Fab() {
  return (
    <div
      flex="~ col items-center justify-between gap-y-2"
      border="~ border rounded-lg"
      bg="white/50 dark:zinc-900/50"
      className="bottom-5 sm:bottom-3rem right-3 sm:right-3rem shadow-black/10 shadow-md transition-all"
      fixed
      z-99
      p-1
      backdrop-blur
    >
      <ThemeToggle />
      <ToTopButton />
    </div>
  )
}
