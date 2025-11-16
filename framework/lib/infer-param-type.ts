import type { Prettify } from 'better-auth'

// Extract parameter name and type from a single segment
type ExtractParam<Segment extends string>
  = Segment extends `[...${infer Param}]`
    ? { [K in Param]: string[] | undefined }
    : Segment extends `[[${infer Param}]]`
      ? { [K in Param]: string | undefined }
      : Segment extends `[${infer Param}]`
        ? { [K in Param]: string }
        // eslint-disable-next-line ts/no-empty-object-type
        : {}

// Split path by '/' and process each segment
type ProcessPath<Path extends string>
  = Path extends `${infer First}/${infer Rest}`
    ? ExtractParam<First> & ProcessPath<Rest>
    : ExtractParam<Path>

/**
 * - `[name]` => `{name: string}`
 * - `[[name]]` => `{name: string|undefined}`
 * - `[...name]` => `{name: string[]|undefined}`
 */
export type InferPathParams<Path extends string> = Prettify<ProcessPath<Path>>
