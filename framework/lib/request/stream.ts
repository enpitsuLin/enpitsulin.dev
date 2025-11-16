// Utility functions for web streams

export function stringToStream(str: string): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(str))
      controller.close()
    },
  })
}

export async function streamToBase64(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader()
  let binary = ''
  let result: ReadableStreamReadResult<unknown>
  do {
    result = await reader.read()
    if (result.value) {
      if (!(result.value instanceof Uint8Array)) {
        throw new TypeError('Unexepected buffer type')
      }
      for (let i = 0; i < result.value.length; i++) {
        binary += String.fromCharCode(result.value[i]!)
      }
    }
  } while (!result.done)
  return btoa(binary)
}

export function base64ToStream(base64: string): ReadableStream {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  return new Blob([bytes]).stream()
}
