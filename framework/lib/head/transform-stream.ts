import type { Unhead } from 'unhead/server'
import { renderSSRHead } from 'unhead/server'

const headRegex = /<\/head>/
const htmlTagRegex = /<html(\s[^>]*)?>/i
const bodyTagRegex = /<body(\s[^>]*)?>/i
const trailer = '</body></html>'

const encoder = new TextEncoder()

export function injectUnHead(head: Unhead) {
  const decoder = new TextDecoder()
  const {
    promise: flightDataPromise,
    resolve: resolveFlightDataPromise,
  } = Promise.withResolvers<void>()

  let headObj: Awaited<ReturnType<typeof renderSSRHead>> | null = null

  const renderSSRPromise = renderSSRHead(head).then((res) => {
    headObj = res
  })

  const buffered: any[] = []
  let timeout: ReturnType<typeof setTimeout> | null = null

  function flushBufferedChunks(
    controller: TransformStreamDefaultController<Uint8Array<ArrayBufferLike>>,
  ) {
    if (!headObj) {
      throw new Error('\`headObj\` didn\'t initialzed yet')
    }

    for (const chunk of buffered) {
      let buf = decoder.decode(chunk, { stream: true })
      if (buf.match(headRegex)) {
        buf = buf
          // Replace <html> tag with attributes
          .replace(htmlTagRegex, `<html ${headObj.htmlAttrs}>`)
          // Inject head tags before </head>
          .replace(headRegex, `${headObj.headTags}</head>`)
          // Replace <body> tag with attributes and inject body tags
          .replace(bodyTagRegex, `<body ${headObj.bodyAttrs}>${headObj.bodyTagsOpen}`)
      }
      if (buf.endsWith(trailer)) {
        buf = buf.slice(0, -trailer.length)
      }
      controller.enqueue(encoder.encode(buf))
    }

    let remaining = decoder.decode()
    if (remaining.length) {
      if (remaining.endsWith(trailer)) {
        remaining = remaining.slice(0, -trailer.length)
      }
      controller.enqueue(encoder.encode(remaining))
    }

    buffered.length = 0
    timeout = null
  }

  return new TransformStream<any, Uint8Array<ArrayBufferLike>>({
    async start() {
      await renderSSRPromise
    },
    transform(chunk, controller) {
      buffered.push(chunk)
      if (timeout) {
        return
      }
      timeout = setTimeout(async () => {
        try {
          flushBufferedChunks(controller)
          resolveFlightDataPromise()
        }
        catch (e) {
          controller.error(e)
          resolveFlightDataPromise()
        }
      }, 0)
    },
    async flush(controller) {
      await flightDataPromise
      if (timeout) {
        clearTimeout(timeout)
        flushBufferedChunks(controller)
      }
    },
  })
}
