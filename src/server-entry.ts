/// <reference types="vite/client" />

import type { FunctionComponent, ReactNode } from 'react'
import defu from 'defu'
import { contextStorage } from 'hono/context-storage'
import { createPages } from 'waku'
import adapter from 'waku/adapters/cloudflare'
import cloudflareMiddleware from './middleware/cloudflare'

const METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
] as const

type Method = (typeof METHODS)[number]

type APIHandler = (req: Request) => Promise<Response>

const IGNORED_PATH_PARTS = new Set(['_components', '_hooks'])

/** Ignore paths like `_components` and `_hooks` in pages dir */
function isIgnoredPath(paths: string[]) {
  return paths.some(p => IGNORED_PATH_PARTS.has(p))
}

/** Check if the last path item is a special file */
function isSpecialFile(lastItem: string | undefined) {
  if (!lastItem)
    return false
  return ['_layout', 'index', '_root'].includes(lastItem) || lastItem.startsWith('_part')
}

/** Generate route path from path items */
function generateRoutePath(pathItems: string[]) {
  const items = isSpecialFile(pathItems.at(-1)) ? pathItems.slice(0, -1) : pathItems
  return `/${items.join('/')}`
}

interface PageModule {
  default: FunctionComponent<{ children: ReactNode }> | APIHandler
  getConfig?: () => Promise<{
    render?: 'static' | 'dynamic'
  }>
  GET?: APIHandler
  POST?: APIHandler
  PUT?: APIHandler
  DELETE?: APIHandler
  PATCH?: APIHandler
  HEAD?: APIHandler
  OPTIONS?: APIHandler
  CONNECT?: APIHandler
  TRACE?: APIHandler
}

const pages = import.meta.glob<PageModule>('./**/*.{tsx,ts}', { base: './pages', exhaustive: true })

interface FsRouterOptions {
  /** e.g. `"api"` will detect pages in `src/pages/api`. */
  apiDir: string
  routesDir: string
  /** e.g. `"_slices"` will detect slices in `src/pages/_slices`. */
  slicesDir: string
}

const defaultOptions: FsRouterOptions = {
  apiDir: 'api',
  routesDir: 'routes',
  slicesDir: '_slices',
}

function fsRouter(options?: FsRouterOptions) {
  const opts = defu(options, defaultOptions)

  return createPages(
    async ({ createPage, createLayout, createRoot, createApi, createSlice }) => {
      for (let file in pages) {
        const mod = await pages[file]!()
        // strip "./" prefix
        file = file.replace(/^\.\//, '')

        const config = await mod.getConfig?.()

        const pathItems = file
          .replace(/\.\w+$/, '')
          .split('/')
          .filter(Boolean)

        if (isIgnoredPath(pathItems)) {
          continue
        }

        const lastItem = pathItems.at(-1)!
        const firstItem = pathItems.at(0)!
        const path = generateRoutePath(pathItems)

        // Validation
        if (lastItem === '[path]') {
          throw new Error(
            'Page file cannot be named [path]. This will conflict with the path prop of the page component.',
          )
        }

        // Handle API and routes
        if ([opts.apiDir, opts.routesDir].includes(firstItem)) {
          const apiPath = firstItem === opts.apiDir
            ? pathItems.join('/')
            : pathItems.toSpliced(0, 1).join('/')

          if (config?.render === 'static') {
            if (Object.keys(mod).length !== 2 || !mod.GET) {
              console.warn(
                `API ${path} is invalid. For static API routes, only a single GET handler is supported.`,
              )
            }
            createApi({
              path: apiPath,
              render: 'static',
              method: 'GET',
              handler: mod.GET!,
            })
          }
          else {
            const validMethods = new Set(METHODS)
            const handlers: Partial<Record<Method | 'all', APIHandler>> = {}

            for (const [exportName, handler] of Object.entries(mod) as [keyof PageModule, APIHandler][]) {
              // Skip special exports
              if (exportName === 'getConfig')
                continue

              const isValidMethod = validMethods.has(exportName as Method)

              if (exportName === 'default') {
                handlers.all = handler
              }
              else if (isValidMethod) {
                handlers[exportName] = handler
              }
              else {
                console.warn(
                  `API ${path} has an invalid export: ${exportName}. Valid exports are: ${METHODS.join(', ')}`,
                )
              }
            }

            createApi({
              path: apiPath,
              render: 'dynamic',
              handlers,
            })
          }
        }
        // Handle slices
        else if (firstItem === opts.slicesDir) {
          createSlice({
            component: mod.default as FunctionComponent<{ children: ReactNode }>,
            render: 'static',
            id: pathItems.slice(1).join('/'),
            ...config,
          })
        }
        // Handle layouts
        else if (lastItem === '_layout') {
          createLayout({
            path,
            component: mod.default as FunctionComponent<{ children: ReactNode }>,
            render: 'static',
            ...config,
          })
        }
        // Handle root
        else if (lastItem === '_root') {
          createRoot({
            component: mod.default as FunctionComponent<{ children: ReactNode }>,
            render: 'static',
            ...config,
          })
        }
        // Handle regular pages
        else {
          createPage({
            path,
            component: mod.default,
            render: 'static',
            ...config,
          } as never) // FIXME avoid as never
        }
      }
      // HACK: to satisfy the return type, unused at runtime
      return null as never
    },
  )
}

export default adapter(
  fsRouter(),
  { middlewareFns: [contextStorage, cloudflareMiddleware] },
)
