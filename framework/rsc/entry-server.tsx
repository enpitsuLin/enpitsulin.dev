import type { RscPayload } from '@framework/server'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ReactFormState } from 'react-dom/client'
import { getErrorInfo } from '@framework/lib/custom-error'
import { UnheadProvider } from '@framework/lib/head/provider'
import { injectUnHead } from '@framework/lib/head/transform-stream'
import * as ReactClient from '@vitejs/plugin-rsc/ssr'
import { captureOwnerStack, use } from 'react'
import * as ReactDOMServer from 'react-dom/server.edge'
import { injectRSCPayload } from 'rsc-html-stream/server'
import { createHead } from 'unhead/server'

export async function renderHtmlStream(
  rscStream: ReadableStream<Uint8Array>,
  options: {
    formState?: ReactFormState
    nonce?: string
  },
) {
  const [stream1, stream2] = rscStream.tee()

  const unhead = createHead()

  let htmlPromise: Promise<RscPayload> | undefined
  function SsrRoot() {
    htmlPromise ??= ReactClient.createFromReadableStream<RscPayload>(stream1)
    return (
      <UnheadProvider value={unhead}>
        {use(htmlPromise).root}
      </UnheadProvider>
    )
  }

  const bootstrapScriptContent = await loadBootstrapScriptContent()

  let htmlStream: ReadableStream<Uint8Array>
  let status: ContentfulStatusCode | undefined

  try {
    htmlStream = await ReactDOMServer.renderToReadableStream(<SsrRoot />, {
      bootstrapScriptContent,
      nonce: options?.nonce,
      formState: options?.formState,
      onError(e) {
        if (
          e
          && typeof e === 'object'
          && 'digest' in e
          && typeof e.digest === 'string'
        ) {
          return e.digest
        }
        console.error('[SSR Error]', captureOwnerStack?.() || '', '\n', e)
      },
    })
  }
  catch (e) {
    console.error('entry-server L58')
    const info = getErrorInfo(e)

    if (info?.location) {
      // keep unstable_redirect error as http redirection
      throw e
    }
    status = info?.status || 500
    const ssrErrorRoot = (
      <html>
        <body></body>
      </html>
    )
    htmlStream = await ReactDOMServer.renderToReadableStream(ssrErrorRoot, {
      bootstrapScriptContent: `self.__NO_HYDRATE=1;${bootstrapScriptContent}`,
      nonce: options?.nonce,
    })
  }

  let responseStream: ReadableStream<Uint8Array> = htmlStream

  responseStream = responseStream
    .pipeThrough(injectRSCPayload(stream2, { nonce: options?.nonce }))
    .pipeThrough(injectUnHead(unhead))

  return { stream: responseStream, status }
}

function loadBootstrapScriptContent(): Promise<string> {
  return import.meta.viteRsc.loadBootstrapScriptContent('index')
}
