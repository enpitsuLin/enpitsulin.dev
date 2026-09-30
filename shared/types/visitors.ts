import type { z } from 'zod'
import type { visitorPageMessageSchema, visitorsMessageSchema } from '../schemas/visitors'

export type VisitorsMessage = z.infer<typeof visitorsMessageSchema>
export type VisitorPageMessage = z.infer<typeof visitorPageMessageSchema>
