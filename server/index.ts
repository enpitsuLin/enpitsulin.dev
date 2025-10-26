import type { EventHandlerWithFetch } from 'h3'
import { H3 } from 'h3'
import { serve } from 'srvx/cloudflare'
import entryServerHandler from '~/entry-server'

// Create an app instance
const app = new H3()

const routeFiles = import.meta.glob<EventHandlerWithFetch>('./routes/**/*.ts', { eager: true, import: 'default' })

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

app.get('/*', entryServerHandler)

export default serve({
  fetch: app.fetch,
})
