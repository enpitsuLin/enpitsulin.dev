export function useOauthPopup(pollInterval = 1000) {
  const popup = ref<Window | null>(null)
  const popupInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const locationURL = shallowRef('')

  const { promise, resolve, reject } = Promise.withResolvers<void>()

  const { resume } = useIntervalFn(
    () => {
      if (!popup.value?.location.href) {
        return
      }
      const popupOrigin = new URL(popup.value?.location.href).origin
      const isDone = popupOrigin === locationURL.value
      try {
        if (popup.value && (popup.value.closed || isDone)) {
          if (popupInterval.value) {
            clearInterval(popupInterval.value)
          }
          if (!popup.value.closed) {
            popup.value.close()
          }
          if (isDone) {
            resolve()
          }
        }
      }
      catch (e) {
        console.error(e)
        reject(e)
      }
    },
    pollInterval,
    { immediate: false },
  )

  function openOauthPopup(url: string) {
    const st = 'toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,'
    const left = screen.width / 2 - 300
    const top = screen.height / 2 - 350

    if (popup.value) {
      popup.value.close()
    }

    popup.value = window.open(url, '', `${st}top=${top},left=${left},width=560,height=620`)
    locationURL.value = new URL(window.location.href).origin

    resume()

    return promise
  }

  onScopeDispose(() => {
    if (popupInterval.value) {
      clearInterval(popupInterval.value)
    }
    if (popup.value) {
      popup.value.close()
    }
  })

  return {
    openOauthPopup,
  }
}
