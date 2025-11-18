'use client'

import type { ComponentProps } from 'react'
import type { User } from '@/auth'
import { Avatar } from '@ark-ui/react'

export interface UserAvatarProps extends ComponentProps<'div'> {
  user: User
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar.Root of-hidden rounded-full {...props}>
      <Avatar.Fallback
        size-full
        flex="data-[state=visible]:inline items-center justify-center"
      >
        {user?.name?.charAt(0).toUpperCase() ?? 'U'}
      </Avatar.Fallback>
      <Avatar.Image src={user?.image ?? undefined} alt="avatar" />
    </Avatar.Root>
  )
}
