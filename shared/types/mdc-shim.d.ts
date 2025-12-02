import type { ParsedMDCData, ParsedPostResult } from './post'

declare module '@nuxtjs/mdc' {
  interface MDCData extends ParsedMDCData {
  }
}

declare module '@nuxtjs/mdc/runtime' {
  declare const parseMarkdown: (
    md: string,
    markdownParserOptions?: MDCParseOptions,
    parseOptions?: {
      fileOptions?: VFileOptions
    },
  ) => Promise<ParsedPostResult>
}

export { }
