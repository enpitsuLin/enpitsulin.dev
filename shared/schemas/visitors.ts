import { z } from 'zod'

export const visitorPathSchema = z.string()
  .max(2048)
  .startsWith('/')
  .refine(path => !path.startsWith('//'))
  .transform(path => path.split(/[?#]/)[0]!)

const visitorCountSchema = z.number().int().nonnegative().safe()

export const visitorsMessageSchema = z.object({
  visitors: visitorCountSchema,
  pageVisitors: visitorCountSchema,
  path: visitorPathSchema,
}).refine(message => message.pageVisitors <= message.visitors)

export const visitorPageMessageSchema = z.object({
  type: z.literal('page'),
  path: visitorPathSchema,
})
