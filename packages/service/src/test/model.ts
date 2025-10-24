/* eslint-disable ts/no-namespace */
// Model define the data structure and validation for the request and response
import { z } from 'zod'

export namespace TestModel {
  export const hiBody = z
    .object({
      name: z.literal('enpitsulin'),
    })
    .describe('hi body')
    .meta({
      ref: 'hiBody',
    })

  // Define it as TypeScript type
  export type hiBody = z.infer<typeof hiBody>

  // Repeat for other models
  export const hiResponse = z.object({
    message: z.string(),
  })

  export type hiResponse = z.infer<typeof hiResponse>

  export const hiInvalid = z.literal('Invalid name')
  export type hiInvalid = z.infer<typeof hiInvalid>
}
