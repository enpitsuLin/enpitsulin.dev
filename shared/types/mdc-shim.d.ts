import '@nuxtjs/mdc'

declare module '@nuxtjs/mdc' {
  interface MDCData {
    estimation: {
      minutes: number
      time: number
      words: number
      chars: number
      text: string
    }
  }
}

export {}
