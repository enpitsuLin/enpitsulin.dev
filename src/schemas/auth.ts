import { z } from 'zod'

// 登录表单验证模式
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少需要6个字符'),
})

// 注册表单验证模式
export const signupSchema = z.object({
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

// 类型导出
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
