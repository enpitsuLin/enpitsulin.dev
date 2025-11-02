import type { Script } from '@unhead/vue'
import type { Context } from 'hono'
import type { ZootSSRContext } from '~~/lib/app'
import type { Env } from '~~/server/middleware/context'
import { createHead } from '@unhead/vue/server'
import { stringify, uneval } from 'devalue'

export function renderPayloadJsonScript(opt: { ssrContext: ZootSSRContext, data?: any }) {
  const contents = opt.data ? stringify(opt.data, opt.ssrContext._payloadReducers) : ''

  const payload: Script = {
    type: 'application/json',
    innerHTML: contents,
    id: '__ZOOT_DATA__',
  }
  const config = uneval(opt.ssrContext.runtimeConfig)

  return [
    payload,
    {
      innerHTML: `window.__ZOOT__={};window.__ZOOT__.config=${config}`,
    },
  ]
}

export function createSSRContext(c: Context<Env>): ZootSSRContext {
  const url = new URL(c.req.url)
  const runtimeConfig = {
    public: {},
    app: {
      baseURL: url.origin,
    },
  }
  const ssrContext: ZootSSRContext = {
    url: url.toString(),
    zoot: {} as unknown as ZootSSRContext['zoot'],
    context: c,
    modules: new Set<string>(),
    teleports: {} as Record<string, string>,
    head: createHead(),
    payload: {
      error: undefined,
      data: {},
      state: {},
      config: runtimeConfig,
    },
    runtimeConfig,
    _payloadReducers: Object.create(null),
  }

  return ssrContext
}
