import type { VisitorPageMessage } from '#shared/types/visitors'
import { useState } from '#imports'
import { visitorsMessageSchema } from '#shared/schemas/visitors'

export function useVisitors() {
  const route = useRoute()
  const visitors = useState<number | null>('visitors', () => null)
  const pageVisitors = useState<number | null>('page-visitors', () => null)

  const { close, open, ws, status, send } = useWebSocket('/api/visitors/ws', {
    onConnected() {
      sendCurrentPage()
    },
    onMessage(_ws, event) {
      void handleMessage(_ws, event)
    },
    autoReconnect: true,
    immediate: false,
  })

  onMounted(open)

  watch(() => route.path, () => {
    pageVisitors.value = null
    sendCurrentPage()
  }, { flush: 'sync' })

  watch(status, (value) => {
    if (value !== 'OPEN') {
      visitors.value = null
      pageVisitors.value = null
    }
  })

  function sendCurrentPage() {
    const message: VisitorPageMessage = { type: 'page', path: route.path }
    // Reconnects report the latest path instead of replaying navigation while offline.
    send(JSON.stringify(message), false)
  }

  async function handleMessage(socket: NonNullable<typeof ws.value>, event: MessageEvent) {
    try {
      const data = typeof event.data === 'string' ? event.data : await event.data.text()
      const result = visitorsMessageSchema.safeParse(JSON.parse(data))
      if (socket !== ws.value || status.value !== 'OPEN' || !result.success || result.data.path !== route.path)
        return

      visitors.value = result.data.visitors
      pageVisitors.value = result.data.pageVisitors
    }
    catch (err: unknown) {
      console.error('Failed to parse visitors WebSocket data:', err)
    }
  }

  return {
    visitors,
    pageVisitors,
    ws,
    status,
    close,
    open,
  }
}
