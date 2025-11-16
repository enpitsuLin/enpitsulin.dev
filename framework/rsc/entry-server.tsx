import type { RscPayload } from '@framework/server'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ReactFormState } from 'react-dom/client'
import { UnheadProvider } from '@framework/lib/head/provider'
import { injectUnHead } from '@framework/lib/head/transform-stream'
import * as ReactClient from '@vitejs/plugin-rsc/ssr'
import React from 'react'
import * as ReactDOMServer from 'react-dom/server.edge'
import { injectRSCPayload } from 'rsc-html-stream/server'
import { createHead } from 'unhead/server'

export async function renderHTML(
  rscStream: ReadableStream<Uint8Array>,
  options: {
    formState?: ReactFormState
    nonce?: string
    debugNojs?: boolean
  },
) {
  const [rscStream1, rscStream2] = rscStream.tee()

  const unhead = createHead()

  let payload: Promise<RscPayload> | undefined
  function SsrRoot() {
    payload ??= ReactClient.createFromReadableStream<RscPayload>(rscStream1)
    return (
      <UnheadProvider value={unhead}>
        {React.use(payload).root}
      </UnheadProvider>
    )
  }

  const bootstrapScriptContent
    = await import.meta.viteRsc.loadBootstrapScriptContent('index')

  let htmlStream: ReadableStream<Uint8Array>
  let status: ContentfulStatusCode | undefined

  try {
    htmlStream = await ReactDOMServer.renderToReadableStream(<SsrRoot />, {
      bootstrapScriptContent: options?.debugNojs
        ? undefined
        : bootstrapScriptContent,
      nonce: options?.nonce,
      formState: options?.formState,
    })
  }
  catch (e) {
    if (e instanceof Error && e.message === 'not found') {
      return 'notFound'
    }
    // fallback to render an empty shell and run pure CSR on browser,
    // which can replay server component error and trigger error boundary.
    status = 500
    htmlStream = await ReactDOMServer.renderToReadableStream(
      <html>
        <body>
          <div id="ssr-error">
            {JSON.stringify(e)}
          </div>
          <noscript>Internal Server Error: SSR failed</noscript>
        </body>
      </html>,
      {
        bootstrapScriptContent:
          `self.__NO_HYDRATE=1;${
            options?.debugNojs ? '' : bootstrapScriptContent}`,
        nonce: options?.nonce,
      },
    )
  }

  let responseStream: ReadableStream<Uint8Array> = htmlStream
  if (!options?.debugNojs) {
    responseStream = responseStream
      .pipeThrough(
        injectRSCPayload(rscStream2, {
          nonce: options?.nonce,
        }),
      )
      .pipeThrough(injectUnHead(unhead))
  }

  return { stream: responseStream, status }
}
