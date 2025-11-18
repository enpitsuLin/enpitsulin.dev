import type { GreaterThan, Sum, UnionToTuple } from 'type-fest'

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

/**
 * Split path string into segments array
 * Handles optional groups like {/:param}
 * @internal
 */
export type SplitPath<Path extends string>
  = Path extends `/${infer Rest}`
    ? SplitPathSegments<Rest>
    : Path extends ''
      ? []
      : SplitPathSegments<Path>

type SplitPathSegments<Path extends string>
  // Handle optional groups {xxx} first (only appears in Pattern)
  = Path extends `${infer Before}{${infer Optional}}${infer After}`
    ? Before extends ''
      ? [`{${Optional}}`, ...SplitPathSegments<RemoveLeadingSlash<After>>]
      : [...SplitSegment<Before>, `{${Optional}}`, ...SplitPathSegments<RemoveLeadingSlash<After>>]
  // Normal segment split by /
    : Path extends `${infer Segment}/${infer Rest}`
      ? [Segment, ...SplitPathSegments<Rest>]
      : Path extends ''
        ? []
        : [Path]

// Helper: remove leading slash from path
type RemoveLeadingSlash<Path extends string>
  = Path extends `/${infer Rest}` ? Rest : Path

// Helper: split simple path segments without {}
type SplitSegment<S extends string>
  = S extends `${infer Seg}/${infer Rest}`
    ? [Seg, ...SplitSegment<Rest>]
    : S extends '' ? [] : [S]

/**
 * Check if a route pattern matches a given path
 * @internal
 */
export type PathMatches<Pattern extends string, Path extends string>
  = MatchSegments<SplitPath<Pattern>, SplitPath<Path>>

type MatchSegments<PatternSegs extends string[], PathSegs extends string[]>
  = PatternSegs extends []
    ? PathSegs extends [] ? true : false
    : PatternSegs extends [infer PFirst extends string, ...infer PRest extends string[]]
    // Wildcard *splat - matches all remaining (including empty)
      ? PFirst extends `*${string}`
        ? true
        : PathSegs extends []
          ? AllOptional<PatternSegs> // Check if remaining pattern segments are all optional
          : PathSegs extends [infer PathFirst extends string, ...infer PathRest extends string[]]
            ? PFirst extends `{${infer OptContent}}` // Optional group {/:param} - try two cases
              ? MatchSegments<PRest, PathSegs> extends true // Case 1: skip this optional group (don't consume path segment)
                ? true
                : MatchOptionalContent<OptContent, PathFirst> extends true // Case 2: match optional group content (consume path segment)
                  ? MatchSegments<PRest, PathRest>
                  : false
              : PFirst extends `:${infer _}?` // Optional parameter :param?
                ? MatchSegments<PRest, PathSegs> extends true
                  ? true
                  : MatchSegments<PRest, PathRest>
                : PFirst extends `:${string}` // Dynamic parameter :param
                  ? MatchSegments<PRest, PathRest>
                  : PFirst extends PathFirst // Exact match
                    ? MatchSegments<PRest, PathRest>
                    : false
            : false
      : false

// Match optional group content (like /:version or .ext)
type MatchOptionalContent<Content extends string, PathSeg extends string>
  = Content extends `/:${string}` ? true // /:param form, matches any segment
    : Content extends `.${infer _Ext}` ? PathSeg extends `.${string}` ? true : false // .ext form
      : false

type AllOptional<Segs extends string[]>
  = Segs extends []
    ? true
    : Segs extends [infer First extends string, ...infer Rest extends string[]]
      ? First extends `:${string}?` | `{${string}}`
        ? AllOptional<Rest>
        : false
      : false

/**
 * Calculate priority score for a route pattern
 * Scoring rules:
 * - Exact segment: +100
 * - Dynamic parameter :param: +10
 * - Optional parameter :param? or {/:param}: +5
 * - Wildcard *splat: +1
 * @internal
 */
export type CalculateScore<Pattern extends string>
  = CalculateSegmentsScore<SplitPath<Pattern>, 0>

type CalculateSegmentsScore<Segs extends string[], Acc extends number>
  = Segs extends []
    ? Acc
    : Segs extends [infer First extends string, ...infer Rest extends string[]]
      ? First extends `*${string}`
        ? CalculateSegmentsScore<Rest, Add<Acc, 1>>
        : First extends `{${string}}` | `:${string}?`
          ? CalculateSegmentsScore<Rest, Add<Acc, 5>>
          : First extends `:${string}`
            ? CalculateSegmentsScore<Rest, Add<Acc, 10>>
            : CalculateSegmentsScore<Rest, Add<Acc, 100>>
      : Acc

// Number addition using type-fest's Sum
type Add<A extends number, B extends number> = Sum<A, B>

/**
 * Filter matching paths from a union type
 * @internal
 */
export type FilterMatchingPaths<Path extends string, Paths extends string>
  = Paths extends infer Pattern extends string
    ? PathMatches<Pattern, Path> extends true
      ? Pattern
      : never
    : never

/**
 * Select the best match from multiple matching patterns
 * @internal
 */
export type SelectBestMatch<Matches extends { str: string, score: number }[]>
  = Matches extends [infer First extends { str: string, score: number }, ...infer Rest extends { str: string, score: number }[]]
    ? Rest extends []
      ? First['str']
      : SelectBestMatchHelper<Rest, First['score'], First['str']>
    : never

// Helper type to find the match with maximum score
type SelectBestMatchHelper<
  Rest extends { str: string, score: number }[],
  MaxScore extends number,
  MaxStr extends string,
> = Rest extends [infer Next extends { str: string, score: number }, ...infer RestRest extends { str: string, score: number }[]]
  ? GreaterThan<Next['score'], MaxScore> extends true
    ? RestRest extends []
      ? Next['str']
      : SelectBestMatchHelper<RestRest, Next['score'], Next['str']>
    : RestRest extends []
      ? MaxStr
      : SelectBestMatchHelper<RestRest, MaxScore, MaxStr>
  : MaxStr

/**
 * Find the most matching path from a list of paths
 */
export type MostMatchPath<
  Path extends string,
  Paths extends string,
> = FilterMatchingPaths<Path, Paths> extends infer Matches extends string
  ? SelectBestMatch<PathUnionToTuple<Matches>>
  : never

type PathUnionToTuple<Paths extends string>
  = UnionToTuple<Paths> extends infer PathsTuple extends string[]
    ? PathTupleToScoreTuple<PathsTuple>
    : never

type PathTupleToScoreTuple<Paths extends string[]>
  = Paths extends [infer First extends string, ...infer Rest extends string[]]
    ? [{ str: First, score: CalculateScore<First> }, ...PathTupleToScoreTuple<Rest>]
    : []
