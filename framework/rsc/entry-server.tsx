import type { RscPayload } from '@framework/server'
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
    return <FixSsrThenable>{React.use(payload).root}</FixSsrThenable>
  }

  function FixSsrThenable(props: React.PropsWithChildren) {
    return (
      <UnheadProvider value={unhead}>
        {props.children}
      </UnheadProvider>
    )
  }

  const bootstrapScriptContent
    = await import.meta.viteRsc.loadBootstrapScriptContent('index')
  const htmlStream = await ReactDOMServer.renderToReadableStream(<SsrRoot />, {
    bootstrapScriptContent: options?.debugNojs
      ? undefined
      : bootstrapScriptContent,
    nonce: options?.nonce,
    ...{ formState: options?.formState },
  })

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

  return responseStream
}
