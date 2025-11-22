import type { Context } from 'hono'
import type { ZootSSRContext } from '~~/lib/app'
import type { Env } from '~~/server/middleware/context'
import { renderSSRHead } from '@unhead/vue/server'
import { renderToString } from 'vue/server-renderer'
import { createSSRContext, renderPayloadJsonScript } from '~~/lib/renderer'
import clientEntryAssets from './entry-client?assets=client'
import { createEntry } from './main'

export async function render(c: Context<Env>) {
  const ssrContext = createSSRContext(c)

  const app = await createEntry(ssrContext)

  const rendered = await renderToString(app, ssrContext).catch(async (err) => {
    await ssrContext.zoot?.hooks.callHook('app:error', err)
    throw err
  })

  const head = ssrContext.head

  await app.$zoot.callHook('app:rendered', { ssrContext })

  head.push({
    script: [
      { type: 'module', src: clientEntryAssets.entry },
    ],
    link: clientEntryAssets.css
      .map(attrs => ({
        rel: 'stylesheet',
        ...attrs,
      }))
      .concat(
        clientEntryAssets.js.map(attrs => ({
          rel: 'modulepreload',
          ...attrs,
        })),
      ),
  })

  // Payload
  head.push(
    { script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) },
    {
    // this should come before another end of body scripts
      tagPosition: 'bodyClose',
      tagPriority: 'high',
    },
  )

  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, {})
  const htmlContext: ZootRenderHTMLContext = {
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([
      bodyTagsOpen,
      ssrContext.teleports?.body,
    ]),
    body: [
      `<div id="app">${rendered}</div>`,
      `<div id="teleports">${getDefaultTeleportsTemplate(ssrContext)}</div>`,
    ],
    bodyAppend: [bodyTags],
  }

  // Check if there's a redirect (triggered by router.push in component)
  if (ssrContext.redirect) {
    return c.redirect(ssrContext.redirect, 302)
  }

  return c.html(renderHTMLDocument(htmlContext))
}

function normalizeChunks(chunks: (string | undefined)[]) {
  return chunks.filter(Boolean).map(i => i!.trim())
}

function joinTags(tags: string[]) {
  return tags.join('')
}

function joinAttrs(chunks: string[]) {
  return chunks.join(' ')
}

export interface ZootRenderHTMLContext {
  htmlAttrs: string[]
  head: string[]
  bodyAttrs: string[]
  bodyPrepend: string[]
  body: string[]
  bodyAppend: string[]
}

function renderHTMLDocument(html: ZootRenderHTMLContext) {
  return `<!DOCTYPE html>
<html ${joinAttrs(html.htmlAttrs)}>
<head>${joinTags(html.head)}</head>
<body ${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body>
</html>`
}

function getDefaultTeleportsTemplate(ssrContext: ZootSSRContext) {
  if (!ssrContext.teleports) {
    return ''
  }

  if (!Reflect.has(ssrContext.teleports, '#teleports')) {
    return ''
  }
  return Reflect.get(ssrContext.teleports, '#teleports')
}
