// Framework conventions (arbitrary choices for this demo):
// - Use `_.rsc` URL suffix to differentiate RSC requests from SSR requests

import type { HonoEnv } from '@framework/server'
import type { Context } from 'hono'
import type { Input } from './input'
import type { RenderUtils } from './render'
import { createTemporaryReferenceSet } from '@vitejs/plugin-rsc/rsc'
import { getErrorInfo } from '../custom-error'
import { getInput } from './input'
import { createRenderUtils } from './render'
import { stringToStream } from './stream'

export function toProcessRequest(
  requestHandler: (
    ctx: { input: Input, renderUtils: RenderUtils },
    c: Context<HonoEnv>,
  ) => Promise<ReadableStream | Response | null | undefined>,
) {
  return async (c: Context<HonoEnv>) => {
    const temporaryReferences = createTemporaryReferenceSet()
    const input = await getInput(c, temporaryReferences)

    const renderUtils = createRenderUtils(temporaryReferences)

    let res: Awaited<ReturnType<typeof requestHandler>>
    try {
      res = await requestHandler({ input, renderUtils }, c)
    }
    catch (error) {
      const info = getErrorInfo(error)
      const status = info?.status || 500
      const body = stringToStream(
        (error as { message?: string } | undefined)?.message || String(error),
      )
      const headers: { location?: string } = {}
      if (info?.location) {
        headers.location = info.location
      }
      return new Response(body, { status, headers })
    }

    if (res instanceof ReadableStream) {
      return new Response(res)
    }
    else if (res) {
      return res
    }
  }
}
