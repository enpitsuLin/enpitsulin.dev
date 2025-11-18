/* eslint-disable ts/no-unsafe-function-type */
import type { HonoEnv } from '@framework/server'
import type { Context } from 'hono'
import type { ReactFormState } from 'react-dom/client'
import { decodeAction, decodeFormState, decodeReply, loadServerAction } from '@vitejs/plugin-rsc/rsc'
import { HEADER_ACTION_ID, URL_POSTFIX } from '../request'

export type InputType = 'function' | 'component' | 'action' | 'custom'

/** action is called via `ReactClient.setServerCallback`.  */
export interface ServerFunctionInput {
  type: 'function'
  fn: Function
  args: unknown[]
  pathname: string
  request: Request
}

/** rsc request */
export interface RscComponentInput {
  type: 'component'
  searchParams: URLSearchParams
  pathname: string
  request: Request
}

/**
 * otherwise server function is called via `<form action={...}>`
 * before hydration (e.g. when javascript is disabled).
 * aka progressive enhancement.
 */
export interface ServerActionInput {
  type: 'action'
  fn: () => Promise<ReactFormState | undefined>
  pathname: string
  request: Request
}

/**
 * POST API request or SSR
 */
export interface CustomInput {
  type: 'custom'
  pathname: string
  request: Request
}

export type Input = ServerFunctionInput | RscComponentInput | ServerActionInput | CustomInput

export async function getInput(
  c: Context<HonoEnv>,
  temporaryReferences: unknown,
): Promise<Input> {
  const url = new URL(c.req.url)
  // rsc request
  if (url.pathname.endsWith(URL_POSTFIX)) {
    url.pathname = url.pathname.slice(0, -URL_POSTFIX.length)
    const actionId = c.req.header(HEADER_ACTION_ID)

    if (actionId) {
      const body = await getActionBody(c)
      const args = await decodeReply(body, { temporaryReferences })
      const action = await loadServerAction(actionId)
      return {
        type: 'function',
        fn: action,
        args,
        pathname: url.pathname,
        request: new Request(url, c.req.raw),
      } as ServerFunctionInput
    }
    else {
      const searchParams = url.searchParams
      return {
        type: 'component',
        searchParams,
        pathname: url.pathname,
        request: new Request(url, c.req.raw),
      } as RscComponentInput
    }
  }
  else if (c.req.method === 'POST') {
    const contentType = c.req.header('Content-Type')
    if (
      typeof contentType === 'string'
      && contentType.startsWith('multipart/form-data')
    ) {
      // server action: no js (progressive enhancement)
      const formData = (await getActionBody(c)) as FormData
      const decodedAction = await decodeAction(formData)
      return {
        type: 'action',
        fn: async () => {
          const result = await decodedAction()
          return await decodeFormState(result, formData)
        },
        pathname: decodeURI(url.pathname),
        request: c.req.raw,
      } as ServerActionInput
    }
    else {
      // POST API request
      return {
        type: 'custom',
        pathname: decodeURI(url.pathname),
        request: c.req.raw,
      } as CustomInput
    }
  }
  else {
    return {
      type: 'custom',
      pathname: decodeURI(url.pathname),
      request: c.req.raw,
    } as CustomInput
  }
}

async function getActionBody(c: Context<HonoEnv>) {
  if (!c.req.raw.body) {
    throw new Error('missing request body for server function')
  }
  const contentType = c.req.header('Content-Type')
  if (contentType?.startsWith('multipart/form-data')) {
    return c.req.formData()
  }
  else {
    return c.req.text()
  }
}
