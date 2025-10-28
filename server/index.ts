import type { EventHandlerWithFetch } from 'h3'
import { H3 } from 'h3'
import entryServerHandler from '~/entry-server'

// Create an app instance
const app = new H3()

const routeFiles = import.meta.glob<EventHandlerWithFetch>('./routes/**/*.ts', { eager: true, import: 'default', exhaustive: true })

function registerRoute(path: string, handler: EventHandlerWithFetch) {
  const pathMatch = path.match(/^\.\/routes\/(?<routePath>.+?)(?:\.(?<method>get|post|put|delete|patch|head|options))?\.ts$/)
  if (!pathMatch)
    return

  let routePath = pathMatch.groups?.routePath || ''
  const method = pathMatch.groups?.method || 'all'

  // Convert dynamic route patterns to H3 format
  // [...param] -> *param
  // [param] -> :param
  routePath = routePath
    .replace(/\[\.\.\.(\w+)\]/g, '**') // [...param] -> **
    .replace(/\[(\w+)\]/g, ':$1') // [param] -> :param

  if (!routePath.startsWith('/')) {
    routePath = `/${routePath}`
  }

  // eslint-disable-next-line no-console
  console.log(`Registered ${method.toUpperCase()} ${routePath}`)

  switch (method.toLowerCase()) {
    case 'get':
      app.get(routePath, handler)
      break
    case 'post':
      app.post(routePath, handler)
      break
    case 'put':
      app.put(routePath, handler)
      break
    case 'delete':
      app.delete(routePath, handler)
      break
    case 'patch':
      app.patch(routePath, handler)
      break
    case 'head':
      app.head(routePath, handler)
      break
    case 'options':
      app.options(routePath, handler)
      break
    default:
      app.all(routePath, handler)
  }
}

for (const [path, handler] of Object.entries(routeFiles)) {
  registerRoute(path, handler)
}

app.use((event) => {
  if (!event.runtime?.cloudflare) {
    throw new Error('Cloudflare runtime not found')
  }
  event.context.cloudflare = event.runtime!.cloudflare!
})

app.get('/**', entryServerHandler)

export default {
  async fetch(request, env, context) {
    Object.defineProperties(request, {
      waitUntil: { value: context.waitUntil.bind(context) },
      runtime: {
        enumerable: true,
        value: {
          name: 'cloudflare',
          cloudflare: {
            env,
            context,
          },
        },
      },
      ip: {
        enumerable: true,
        get() {
          return request.headers.get('cf-connecting-ip')
        },
      },
    })

    return app.fetch(request)
  },

} satisfies ExportedHandler<Cloudflare.Env, ExecutionContext>

declare module 'h3' {
  interface H3EventContext {
    cloudflare: {
      env: Cloudflare.Env
      context: ExecutionContext
    }
  }
}
