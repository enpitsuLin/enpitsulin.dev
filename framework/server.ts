import type { ReactFormState } from 'react-dom/client'
import type { PageComponent, RootComponent } from './component'
import type { Router } from './router'
import type { MatchResult } from './router/matcher'

export interface RscPayload {
  root: React.ReactNode
  returnValue: { ok: boolean, data: unknown } | undefined
  formState?: ReactFormState
}

export interface HonoEnv {
  Variables: {
    router: Router<PageModule, { type: 'page' | 'api' }>
    route?: MatchResult<PageModule, { type: 'page' | 'api' }>
    rscActionResult: {
      returnValue: { ok: boolean, data: unknown } | undefined
      formState: ReactFormState | undefined
      temporaryReferences: unknown | undefined
    }
  }
  Binding: Cloudflare.Env
}
export const METHODS = [
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

export type Method = (typeof METHODS)[number]

export type APIHandler = (req: Request) => Promise<Response>

export interface PageModule {
  default: PageComponent | RootComponent | APIHandler
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

export { getContext } from 'hono/context-storage'
