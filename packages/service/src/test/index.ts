import { Hono } from 'hono'
import {
  describeRoute,
  resolver,
  validator as zValidator,
} from 'hono-openapi'
import { TestModel } from './model'
import { TestService } from './service'

export const test = new Hono()
  .get(
    '/hi',
    describeRoute({
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: resolver(TestModel.hiResponse),
            },
          },
        },
        400: {
          description: 'Invalid request',
          content: {
            'application/text': {
              schema: resolver(TestModel.hiInvalid),
            },
          },
        },
      },
    }),
    zValidator('json', TestModel.hiBody, (result, c) => {
      if (!result.success) {
        return c.text('Invalid name', 400)
      }
    }),
    async (c) => {
      const body = c.req.valid('json')
      const response = await TestService.hi(body)

      return c.json(response)
    },
  )

export { TestModel, TestService }
