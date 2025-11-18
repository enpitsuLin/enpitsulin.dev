/**
 * Merge parent and child route parameters
 */
export type MergeParams<Parent, Child> = Parent & Child

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * Helper to extract parameter from optional group patterns like /:name or .ext
 */
type ExtractOptionalParam<T extends string>
  = T extends `/:${infer Param}` ? Param
    : T extends `.${infer Param}` ? Param
      : T

/**
 * Extract route parameters from a path string
 *
 * Supports:
 * - Dynamic params: `:id` → `{ id: string }`
 * - Wildcards: `*splat` → `{ splat: string[] }`
 * - Group `{/:name}` → `{ name?: string }`
 * - Optional params: `/:id?` → `{ id?: string }`
 */
export type ExtractRouteParams<Path extends string> = Prettify<
  // Match optional group {/:name} or {.ext} followed by more path (check first to avoid being matched by dynamic param)
  Path extends `${infer Start}{${infer OptionalContent}}${infer Rest}`
    ? ExtractRouteParams<Start> & { [K in ExtractOptionalParam<OptionalContent>]?: string } & ExtractRouteParams<Rest>
  // Match dynamic parameter followed by more path segments
    : Path extends `${infer _Start}:${infer Param}/${infer Rest}`
      ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    // Match dynamic parameter at the end
      : Path extends `${infer _Start}:${infer Param}`
        ? { [K in Param]: string }
      // Match wildcard parameter followed by more path segments
        : Path extends `${infer _Start}/*${infer Param}/${infer Rest}`
          ? { [K in Param]: string[] } & ExtractRouteParams<`/${Rest}`>
        // Match wildcard parameter at the end
          : Path extends `${infer _Start}/*${infer Param}`
            ? { [K in Param]: string[] }
          // No parameters found
          // eslint-disable-next-line ts/no-empty-object-type
            : {}
>

// Helper: Make a type possibly empty
type MaybeEmpty<T extends string> = T | ''

// Helper: Add prefix to a string if it's not empty
type Prefix<T extends string, P extends string> = T extends '' ? '' : `${P}${T}`

// Helper: Process content inside optional group
type ProcessOptionalContent<Content extends string>
  // Handle dynamic param like /:name
  = Content extends `/:${infer _Param}`
    ? MaybeEmpty<Prefix<string, '/'>>
  // Handle extension like .ext
    : Content extends `.${infer _Param}`
      ? MaybeEmpty<Prefix<string, '.'>>
    // Static content in optional group
      : MaybeEmpty<Content>

/**
 * Accept path that fit specific route pattern
 *
 * - `/static/path` → `/static/path`
 * - `/parent/:name` → `/parent/${string}`
 * - `/parent/*path` → `/parent` | `/parent/${string}` (matches 0 or more segments)
 * - `/parent{/:name}/child` → `/parent${MaybeEmpty<Prefix<string,'/>>}/child`
 */
export type AccpetRoutePath<Path extends string>
  // Match optional group {/:name} or {.ext} followed by more path
  = Path extends `${infer Start}{${infer OptionalContent}}${infer Rest}`
    ? `${AccpetRoutePath<Start>}${ProcessOptionalContent<OptionalContent>}${AccpetRoutePath<Rest>}`
  // Match dynamic parameter followed by more path segments
    : Path extends `${infer Start}:${infer _Param}/${infer Rest}`
      ? `${Start}${string}/${AccpetRoutePath<Rest>}`
    // Match dynamic parameter at the end
      : Path extends `${infer Start}:${infer _Param}`
        ? `${Start}${string}`
      // Match wildcard parameter followed by more path segments
        : Path extends `${infer Start}/*${infer _Param}/${infer Rest}`
          ? `${Start}` | `${Start}/${string}/${AccpetRoutePath<Rest>}`
        // Match wildcard parameter at the end (matches 0 or more segments)
          : Path extends `${infer Start}/*${infer _Param}`
            ? `${Start}` | `${Start}/${string}`
          // Static path
            : Path

interface PathNode<Path extends string = string> {
  path: Path
  children?: PathNode[]
}

/**
 * Helper type to flatten an array of child nodes
 */
type FlattenChildren<
  Nodes extends readonly PathNode[],
  Prefix extends string,
> = Nodes extends readonly [infer First, ...infer Rest]
  ? First extends PathNode
    ? Rest extends readonly PathNode[]
      ? FlattenNodePaths<First, Prefix> | FlattenChildren<Rest, Prefix>
      : FlattenNodePaths<First, Prefix>
    : never
  : never

/**
 * Transform a tree of nodes into a list of paths
 */
export type FlattenNodePaths<
  Root extends PathNode,
  Prefix extends string = '',
> = Root extends { children: infer Children }
  ? Children extends readonly PathNode[]
    // If node has children and Prefix is empty (root node), include both current path and children
    ? (Prefix extends '' ? Root['path'] : never) | FlattenChildren<
      Children,
      // If root path is '/', pass empty string to avoid double slashes
      Prefix extends ''
        ? Root['path'] extends '/'
          ? ''
          : Root['path']
        : `${Prefix}${Root['path']}`
    >
    // If children property exists but is undefined/empty, return the current path
    : Prefix extends '' ? Root['path'] : `${Prefix}${Root['path']}`
  // If node has no children, return the current path
  : Prefix extends '' ? Root['path'] : `${Prefix}${Root['path']}`
