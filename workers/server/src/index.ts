import { test } from '@enpitsulin-dev/service'
import { Hono } from 'hono'

import { openAPIRouteHandler } from 'hono-openapi'

const app = new Hono()
  .route('/test', test)

export default app
  .get(
    '/openapi.json',
    openAPIRouteHandler(app, {
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
