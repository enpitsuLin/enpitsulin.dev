'use client'

import { Field } from '@ark-ui/react/field'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'

const signupSchema = z.object({
  name: z
    .string()
    .min(1, '请输入用户名')
    .min(2, '用户名至少需要2个字符')
    .max(50, '用户名不能超过50个字符')
    .regex(/^[\w\u4E00-\u9FA5]+$/, '用户名只能包含字母、数字、下划线和中文'),
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少需要6个字符')
    .max(100, '密码不能超过100个字符'),
  confirmPassword: z
    .string()
    .min(1, '请确认密码'),
}).refine(data => data.password === data.confirmPassword, {
  message: '密码确认不匹配',
  path: ['confirmPassword'],
})

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof signupSchema>) => {
      const { name, email, password } = data
      return authClient.signUp.email({
        name,
        email,
        password,
      })
    },
  })

  const onSubmit = handleSubmit((data) => {
    mutate(data)
  })

  return (
    <form flex="~ col gap-4" onSubmit={onSubmit}>

      <Field.Root space-y-2 invalid={!!errors.name}>
        <Field.Label>用户名</Field.Label>
        <Field.Input
          placeholder="请输入用户名"
          w-full
          p="x4 y2"
          border="~ border focus:accent data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
          bg="transparent"
          data-invalid={errors.name ? '' : undefined}
          className="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-accent placeholder-zinc-500 dark:placeholder-zinc-400"
          {...register('name')}
        />
        {errors.name && (
          <Field.ErrorText inline-block text="xs red-500">
            {errors.name.message}
          </Field.ErrorText>
        )}
      </Field.Root>

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

      <Field.Root space-y-2 invalid={!!errors.confirmPassword}>
        <Field.Label>确认密码</Field.Label>
        <Field.Input
          type="password"
          placeholder="请再次输入密码"
          w-full
          p="x4 y2"
          border="~ border focus:accent data-[invalid]:red-500 data-[invalid]:focus:red-500 rounded-lg"
          bg="transparent"
          data-invalid={errors.confirmPassword ? '' : undefined}
          className="text-xs text-zinc-900 outline-none transition-all placeholder:text-xs dark:text-white focus:ring-2 focus:ring-accent placeholder-zinc-500 dark:placeholder-zinc-400"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <Field.ErrorText inline-block text="xs red-500">
            {errors.confirmPassword.message}
          </Field.ErrorText>
        )}
      </Field.Root>
      <Button type="submit" disabled={isPending}>
        {isPending ? '注册中...' : '注册'}
      </Button>
    </form>
  )
}
