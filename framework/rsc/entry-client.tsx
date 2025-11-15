import type { RscPayload } from '@framework/server'
import { UnheadProvider } from '@framework/lib/head/provider'
import * as ReactClient from '@vitejs/plugin-rsc/browser'
import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { rscStream } from 'rsc-html-stream/client'
import { createHead } from 'unhead/client'
// import `uno.css` for client side HMR
import 'uno.css'

const unhead = createHead()

async function main() {
  let setPayload: (v: RscPayload) => void

  const initialPayload = await ReactClient.createFromReadableStream<RscPayload>(
    rscStream,
  )

  function BrowserRoot() {
    const [payload, setPayload_] = React.useState(initialPayload)

    React.useEffect(() => {
      setPayload = v => React.startTransition(() => setPayload_(v))
    }, [setPayload_])

    React.useEffect(() => {
      return listenNavigation(() => fetchRscPayload())
    }, [])

    return (
      <UnheadProvider value={unhead}>
        {payload.root}
      </UnheadProvider>
    )
  }

  async function fetchRscPayload() {
    const url = new URL(window.location.href)
    url.searchParams.set('__rsc', 'true')
    const payload = await ReactClient.createFromFetch<RscPayload>(
      fetch(url),

    )
    setPayload(payload)
  }

  ReactClient.setServerCallback(async (id, args) => {
    const url = new URL(window.location.href)
    const temporaryReferences = ReactClient.createTemporaryReferenceSet()
    const payload = await ReactClient.createFromFetch<RscPayload>(
      fetch(url, {
        method: 'POST',
        body: await ReactClient.encodeReply(args, { temporaryReferences }),
        headers: {
          'x-rsc-action': id,
        },
      }),
      { temporaryReferences },
    )
    setPayload(payload)
    return payload.returnValue
  })

  const browserRoot = (
    <React.StrictMode>
      <BrowserRoot />
    </React.StrictMode>
  )
  ReactDOMClient.hydrateRoot(document, browserRoot, {
    formState: initialPayload.formState,
  })

  if (import.meta.hot) {
    import.meta.hot.on('rsc:update', () => {
      fetchRscPayload()
    })
  }
}

function listenNavigation(onNavigation: () => void) {
  window.addEventListener('popstate', onNavigation)

  const oldPushState = window.history.pushState
  window.history.pushState = function (...args) {
    const res = oldPushState.apply(this, args)
    onNavigation()
    return res
  }

  const oldReplaceState = window.history.replaceState
  window.history.replaceState = function (...args) {
    const res = oldReplaceState.apply(this, args)
    onNavigation()
    return res
  }

  function onClick(e: MouseEvent) {
    const link = (e.target as Element).closest('a')
    if (
      link
      && link instanceof HTMLAnchorElement
      && link.href
      && (!link.target || link.target === '_self')
      && link.origin === location.origin
      && !link.hasAttribute('download')
      && e.button === 0
      && !e.metaKey
      && !e.ctrlKey
      && !e.altKey
      && !e.shiftKey
      && !e.defaultPrevented
    ) {
      e.preventDefault()
      history.pushState(null, '', link.href)
    }
  }
  document.addEventListener('click', onClick)

  return () => {
    document.removeEventListener('click', onClick)
    window.removeEventListener('popstate', onNavigation)
    window.history.pushState = oldPushState
    window.history.replaceState = oldReplaceState
  }
}

main()
