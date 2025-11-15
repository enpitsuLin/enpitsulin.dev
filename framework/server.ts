import type { PageComponent, RootComponent } from '@framework/component'
import type { Router, TreeNode } from '@framework/router'
import type { MatchResult } from '@framework/router/matcher'
import type { ReactFormState } from 'react-dom/client'
import { getContext as getHonoContext } from 'hono/context-storage'

export interface RscPayload {
  root: React.ReactNode
  returnValue: { ok: boolean, data: unknown } | undefined
  formState?: ReactFormState
}

export interface HonoEnv {
  Variables: {
    router: Router<PageModule, { type: 'page' | 'api' }>
    route?: MatchResult<PageModule, { type: 'page' | 'api' }>
    routes: TreeNode<PageModule, { type: 'page' | 'api' }>[]
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

export function getContext() {
  return getHonoContext<HonoEnv>()
}
