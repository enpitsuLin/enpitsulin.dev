import { ark } from '@ark-ui/react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'small' | 'large'
  asChild?: boolean
}

export function Button({ variant = 'default', size = 'default', asChild = false, children, ...props }: ButtonProps) {
  return (
    <ark.button
      asChild={asChild}
      flex="inline items-center justify-center gap-2"
      p={cn({
        'x2 y1': size === 'small',
        'x3 y2': size === 'default',
        'x5 y3': size === 'large',
      })}
      bg={cn({
        'zinc-800 hover:zinc-700 dark:zinc-50 dark:hover:zinc-100': variant === 'default',
        'zinc-800/5 hover:zinc-700/10 dark:zinc-50/5 dark:hover:zinc-100/10': variant === 'outline',
      })}
      text={cn([
        'font-medium',
        {
          'zinc-50 xs dark:zinc-900': variant === 'default',
          'zinc-900 xs dark:zinc-50': variant === 'outline',
        },
      ])}
      border={cn([
        {
          '~ zinc-600/50 dark:zinc-400/50': variant === 'outline',
        },
        'rounded-lg',
      ])}
      className="transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </ark.button>
  )
}
