'use client'

import { Field } from '@ark-ui/react/field'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'

const signinSchema = z.object({
  email: z.email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少需要6个字符'),
})

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof signinSchema>) => {
      return authClient.signIn.email(data)
    },
  })

  const onSubmit = handleSubmit((data) => {
    mutate(data)
  })

  return (
    <form flex="~ col gap-4" onSubmit={onSubmit}>
      <Field.Root space-y-2 invalid={!!errors.email}>
        <Field.Label>邮箱</Field.Label>
        <Field.Input
          type="email"
          autoComplete="email"
          placeholder="请输入邮箱地址"
          w-full
          p="x4 y2"
          border="~ border focus:accent data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
          bg="transparent"
          data-invalid={errors.email ? '' : undefined}
          className="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-accent placeholder-zinc-500 dark:placeholder-zinc-400"
          {...register('email')}
        />
        {errors.email && (
          <Field.ErrorText inline-block text="xs red-500">
            {errors.email.message}
          </Field.ErrorText>
        )}
      </Field.Root>
      <Field.Root space-y-2 invalid={!!errors.password}>
        <Field.Label>密码</Field.Label>
        <Field.Input
          type="password"
          autoComplete="current-password"
          placeholder="请输入密码"
          w-full
          p="x4 y2"
          border="~ border focus:accent data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
          bg="transparent"
          data-invalid={errors.password ? '' : undefined}
          className="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-accent placeholder-zinc-500 dark:placeholder-zinc-400"
          {...register('password')}
        />
        {errors.password && (
          <Field.ErrorText inline-block text="xs red-500">
            {errors.password.message}
          </Field.ErrorText>
        )}
      </Field.Root>
      <Button type="submit" disabled={isPending}>
        {isPending ? '登录中...' : '登录'}
      </Button>
    </form>
  )
}
