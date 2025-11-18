import type { RscPayload } from '@framework/server'
import { createFromReadableStream, renderToReadableStream } from '@vitejs/plugin-rsc/rsc'

export interface RenderUtils {
  renderRsc: (payload: RscPayload) => Promise<ReadableStream>
  parseRsc: (rscStream: ReadableStream) => Promise<RscPayload>
  renderHtml: (payload: RscPayload) => Promise<Response>
}

export function createRenderUtils(temporaryReferences: unknown): RenderUtils {
  const onError = (e: unknown) => {
    console.error('Error during rendering:', e)
    if (
      e
      && typeof e === 'object'
      && 'digest' in e
      && typeof e.digest === 'string'
    ) {
      return e.digest
    }
  }

  return {
    async renderRsc(rscPayload) {
      return renderToReadableStream(rscPayload, { temporaryReferences, onError })
    },
    async parseRsc(stream) {
      return createFromReadableStream(stream, {})
    },
    async renderHtml(rscPayload) {
      const ssrEntryModule = await import.meta.viteRsc.loadModule<
        typeof import('@framework/rsc/entry-server')
      >('ssr', 'index')

      const rscHtmlStream = renderToReadableStream(rscPayload, { onError })

      const htmlResult = await ssrEntryModule.renderHtmlStream(rscHtmlStream, {
        formState: rscPayload.formState,
      })
      return new Response(htmlResult.stream, {
        status: htmlResult.status || 200,
        headers: { 'content-type': 'text/html' },
      })
    },
  }
}
