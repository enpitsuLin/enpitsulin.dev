import { test } from '@enpitsulin-dev/service'
import { Hono } from 'hono'

import { openAPIRouteHandler } from 'hono-openapi'

const hono = new Hono()

export const app = hono.route('/test', test)
  .get(
    '/openapi.json',
    openAPIRouteHandler(hono, {
      documentation: {
        info: {
          title: 'enpitsulin.dev server API',
          version: '1.0.0',
          description: 'enpitsulin.dev server API',
        },
        servers: [
          { url: 'http://localhost:8787', description: 'Local Server' },
        ],
      },
    }),
  )
