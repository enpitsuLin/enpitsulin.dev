import type { HeadTag } from '@unhead/vue'
import type { Context } from 'hono'
import type { IntrinsicElementAttributes, PropType, VNode } from 'vue'
import type { SSRContext } from 'vue/server-renderer'
import type { ZootSSRContext } from '~~/lib/app'
import type { Env } from '~~/server/middleware/context'
import { cloneVNode, defineComponent, h } from 'vue'
import { renderToString, renderToWebStream } from 'vue/server-renderer'
import { serializeState } from '~~/lib/state'
import clientEntryAssets from './entry-client?assets=client'
import { createEntry } from './main'

function normalizeProps(props: Record<string, any>) {
  const ret = {} as Record<string, string>
  for (const key in props) {
    if (!Object.hasOwn(props, key))
      continue
    const value = props[key]
    if ((key === 'class' || key === 'style') && typeof value !== 'string') {
      if (key === 'class') {
        ret.class = Array.from((value as unknown as Set<string>)).join(' ')
      }
      else if (key === 'style') {
        ret.style = Array.from((value as unknown as Set<string>)).map(([k, v]) => `${k}:${v}`).join(';')
      }
      continue
    }
    if (value !== false && value !== null) {
      ret[key] = value === true ? '' : value
      continue
    }
  }
  return ret
}

const Template = defineComponent({
  props: {
    tags: {
      type: Array as PropType<HeadTag[]>,
      required: true,
    },
    payload: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    renderContent: {
      type: Object as PropType<SSRContext>,
      required: true,
    },
  },
  setup: ({ tags, payload, content, renderContent: { teleports } }) => {
    const schema = {
      htmlAttrs: {} as IntrinsicElementAttributes['html'],
      bodyAttrs: {} as IntrinsicElementAttributes['body'],
      tags: {
        head: [] as VNode[],
        bodyClose: [] as VNode[],
        bodyOpen: [] as VNode[],
      },
    }
    for (const tag of tags) {
      if (tag.tag === 'htmlAttrs' || tag.tag === 'bodyAttrs') {
        Object.assign(schema[tag.tag], normalizeProps(tag.props))
        continue
      }
      const tagPosition = tag.tagPosition || 'head'
      schema.tags[tagPosition].push(
        h(tag.tag, {
          ...tag.props,
          innerHTML: tag.textContent ?? '',
        }),
      )
    }
    return () => (
      <html {...schema.htmlAttrs}>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00aba9" />
          <meta name="msapplication-TileColor" content="#00aba9" />
          <script innerHTML={`;(function () {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
        if (setting === 'dark' || (prefersDark && setting !== 'light'))
          document.documentElement.classList.toggle('dark', true)
      })()`}
          >

          </script>
          {clientEntryAssets.css.map(attrs => (
            <link rel="stylesheet" crossorigin="" {...attrs} />
          ))}
          {clientEntryAssets.js.map(attrs => (
            <link rel="modulepreload" crossorigin="" {...attrs} />
          ))}
          <script type="module" src={clientEntryAssets.entry} />
          {schema.tags.head.map(tag => cloneVNode(tag))}
        </head>

        <body {...schema.bodyAttrs}>
          {schema.tags.bodyOpen.map(tag => cloneVNode(tag))}
          <div id="app" innerHTML={content}>
          </div>
          {teleports && <div id="teleports" innerHTML={Reflect.get(teleports, '#teleports') ?? ''}></div>}
          <script id="INITIAL_STATE" innerHTML={`window.__ZOOT__=${serializeState(payload)}`}></script>
          <noscript> This website requires JavaScript to function properly. Please enable JavaScript to continue. </noscript>
          {schema.tags.bodyClose.map(tag => cloneVNode(tag))}
        </body>
      </html>
    )
  },
})

export async function render(c: Context<Env>) {
  const url = new URL(c.req.url)

  const runtimeConfig = {
    public: {},
    app: {
      baseURL: url.origin,
    },
  }
  const ssrContext = {
    url: url.toString(),
    zoot: {},
    context: c,
    modules: new Set<string>(),
    teleports: {} as Record<string, string>,
    payload: {
      error: null,
      config: runtimeConfig,
    },
    runtimeConfig,
  } as unknown as ZootSSRContext

  const app = await createEntry(ssrContext)

  const renderResult = await renderToString(app, ssrContext)

  const head = app.$zoot.$head

  await app.$zoot.callHook('app:rendered', { ssrContext })
  const headTags = await head.resolveTags()

  const stream = renderToWebStream(
    <Template
      tags={headTags}
      content={renderResult}
      payload={ssrContext.payload}
      renderContent={ssrContext}
    />,
  )

  return new Response(stream, {
    headers: {
      'content-type': 'text/html',
    },
  })
}
