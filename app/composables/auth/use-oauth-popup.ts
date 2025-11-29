export function useOauthPopup(pollInterval = 1000) {
  const popup = ref<Window | null>(null)
  const locationURL = shallowRef('')

  let { promise, resolve, reject } = Promise.withResolvers<void>()

  const { resume } = useIntervalFn(
    () => {
      try {
        if (!popup.value)
          return

        // 检查弹窗是否被关闭
        if (popup.value.closed) {
          reject(new Error('Popup closed'))
          return
        }

        let popupOrigin: string
        try {
          popupOrigin = new URL(popup.value.location.href).origin
        }
        catch {
          return
        }

        const isDone = popupOrigin === locationURL.value
        if (isDone) {
          popup.value.close()
          popup.value = null
          resolve()
        }
      }
      catch (e) {
        console.error('OAuth popup error:', e)
        reject(e)
      }
    },
    pollInterval,
    { immediate: false },
  )

  function openOauthPopup(url: string) {
    ;({ promise, resolve, reject } = Promise.withResolvers<void>())

    const st = 'toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,'
    const left = screen.width / 2 - 300
    const top = screen.height / 2 - 350

    if (popup.value) {
      popup.value.close()
    }

    popup.value = window.open(url, '', `${st}top=${top},left=${left},width=560,height=620`)

    popup.value?.addEventListener('close', () => {
      reject(new Error('Popup closed'))
    }, { once: true })

    locationURL.value = new URL(window.location.href).origin

    resume()

    return promise
  }

  return {
    openOauthPopup,
  }
}
