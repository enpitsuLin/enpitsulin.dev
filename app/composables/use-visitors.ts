import { useState } from '#imports'

export function useVisitors() {
  // State management
  const visitors = useState<number>('visitors', () => 0)

  const { close, open, ws, status } = useWebSocket('/api/visitors/ws', {
    onMessage(_ws, event) {
      handleMessage(event)
    },
    autoReconnect: true,
  })

  /**
   * Handles WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  async function handleMessage(event: MessageEvent) {
    try {
      const data = typeof event.data === 'string' ? event.data : await event.data.text()
      const payload = JSON.parse(data)
      if (!Array.isArray(payload) && !Number.isNaN(payload) && payload >= 0) {
        visitors.value = payload
      }
      else if (Array.isArray(payload)) {
        visitors.value = payload.length
      }
    }
    catch (err: unknown) {
      console.error('Failed to parse visitors WebSocket data:', err)
    }
  }

  return {
    visitors,
    ws,
    status,
    close,
    open,
  }
}
