/* eslint-disable ts/no-empty-object-type */
import type {
  CalculateScore,
  ExtractRouteParams,
  FilterMatchingPaths,
  FlattenNodePaths,
  MostMatchPath,
  PathMatches,
  SelectBestMatch,
  SplitPath,
} from './type'
import { describe, expectTypeOf, it } from 'vitest'

describe('ExtractRouteParams', () => {
  it('extracts single dynamic parameter', () => {
    type Result = ExtractRouteParams<'/user/:id'>
    expectTypeOf<Result>().toEqualTypeOf<{ id: string }>()
  })

  it('extracts multiple dynamic parameters', () => {
    type Result = ExtractRouteParams<'/user/:userId/post/:postId'>
    expectTypeOf<Result>().toEqualTypeOf<{ userId: string, postId: string }>()
  })

  it('extracts wildcard parameter', () => {
    type Result = ExtractRouteParams<'/files/*path'>
    expectTypeOf<Result>().toEqualTypeOf<{ path: string[] }>()
  })

  it('extracts optional parameter', () => {
    type Result = ExtractRouteParams<'/user{/:id}'>
    expectTypeOf<Result>().toEqualTypeOf<{ id?: string }>()
  })

  it('extracts mixed parameters', () => {
    type Result = ExtractRouteParams<'/:org/:repo/issues/:number'>
    expectTypeOf<Result>().toEqualTypeOf<{ org: string, repo: string, number: string }>()
  })

  it('returns empty object for routes without parameters', () => {
    type Result = ExtractRouteParams<'/static/path'>
    expectTypeOf<Result>().toEqualTypeOf<{}>()
  })

  it('handles complex paths', () => {
    type Result = ExtractRouteParams<'/api/:version/users/:id/posts/*path'>
    expectTypeOf<Result>().toEqualTypeOf<{ version: string, id: string, path: string[] }>()
  })

  it('handles multiple optional groups', () => {
    type Result = ExtractRouteParams<'/api{/:version}/users/:id/posts/file{.ext}'>
    expectTypeOf<Result>().toEqualTypeOf<{ version?: string, id: string, ext?: string }>()
  })
})

describe('FlattenNodePaths', () => {
  it('flattens a tree of nodes into a list of paths', () => {
    type Result = FlattenNodePaths<{
      path: '/'
      children: [
        {
          path: '/foo'
        },
        {
          path: '/bar'
        },
        {
          path: '/baz'
        },
        {
          path: '/qux'
          children: [
            {
              path: '/a'
            },
            {
              path: '/b'
            },
          ]
        },
      ]
    }>

    expectTypeOf<Result>().toEqualTypeOf<'/' | '/foo' | '/bar' | '/baz' | '/qux' | '/qux/a' | '/qux/b'>()
  })
})

describe('SplitPath', () => {
  it('splits basic paths', () => {
    type Result1 = SplitPath<'/'>
    expectTypeOf<Result1>().toEqualTypeOf<[]>()

    type Result2 = SplitPath<'/foo'>
    expectTypeOf<Result2>().toEqualTypeOf<['foo']>()

    type Result3 = SplitPath<'/foo/bar'>
    expectTypeOf<Result3>().toEqualTypeOf<['foo', 'bar']>()
  })

  it('splits paths with dynamic parameters', () => {
    type Result1 = SplitPath<'/bar/:id'>
    expectTypeOf<Result1>().toEqualTypeOf<['bar', ':id']>()

    type Result2 = SplitPath<'/baz/:id?'>
    expectTypeOf<Result2>().toEqualTypeOf<['baz', ':id?']>()
  })

  it('splits paths with optional groups', () => {
    type Result1 = SplitPath<'/api{/:version}/users'>
    expectTypeOf<Result1>().toEqualTypeOf<['api', '{/:version}', 'users']>()

    type Result2 = SplitPath<'/file{.ext}'>
    expectTypeOf<Result2>().toEqualTypeOf<['file', '{.ext}']>()
  })

  it('splits paths with wildcards', () => {
    type Result = SplitPath<'/quz/*splat'>
    expectTypeOf<Result>().toEqualTypeOf<['quz', '*splat']>()
  })

  it('splits actual paths (no special syntax)', () => {
    type Result1 = SplitPath<'/api/v1/users'>
    expectTypeOf<Result1>().toEqualTypeOf<['api', 'v1', 'users']>()

    type Result2 = SplitPath<'/api/users'>
    expectTypeOf<Result2>().toEqualTypeOf<['api', 'users']>()
  })
})

describe('PathMatches', () => {
  it('matches exact paths', () => {
    type Result1 = PathMatches<'/foo', '/foo'>
    expectTypeOf<Result1>().toEqualTypeOf<true>()

    type Result2 = PathMatches<'/foo', '/bar'>
    expectTypeOf<Result2>().toEqualTypeOf<false>()
  })

  it('matches dynamic parameters', () => {
    type Result1 = PathMatches<'/bar/:id', '/bar/123'>
    expectTypeOf<Result1>().toEqualTypeOf<true>()

    type Result2 = PathMatches<'/bar/:id', '/bar/123/extra'>
    expectTypeOf<Result2>().toEqualTypeOf<false>()
  })

  it('matches optional parameters', () => {
    type Result1 = PathMatches<'/baz/:id?', '/baz'>
    expectTypeOf<Result1>().toEqualTypeOf<true>()

    type Result2 = PathMatches<'/baz/:id?', '/baz/optional'>
    expectTypeOf<Result2>().toEqualTypeOf<true>()

    type Result3 = PathMatches<'/baz/:id?', '/baz/opt/extra'>
    expectTypeOf<Result3>().toEqualTypeOf<false>()
  })

  it('matches optional groups', () => {
    type Result1 = PathMatches<'/api{/:version}/users', '/api/users'>
    expectTypeOf<Result1>().toEqualTypeOf<true>()

    type Result2 = PathMatches<'/api{/:version}/users', '/api/v1/users'>
    expectTypeOf<Result2>().toEqualTypeOf<true>()

    type Result3 = PathMatches<'/api{/:version}/users', '/api/v1/users/extra'>
    expectTypeOf<Result3>().toEqualTypeOf<false>()
  })

  it('matches wildcards', () => {
    type Result1 = PathMatches<'/quz/*splat', '/quz/1/2/3'>
    expectTypeOf<Result1>().toEqualTypeOf<true>()

    type Result2 = PathMatches<'/quz/*splat', '/quz'>
    expectTypeOf<Result2>().toEqualTypeOf<true>()
  })

  it('handles priority between wildcard and dynamic param', () => {
    type Result1 = PathMatches<'/quz/:id', '/quz/123'>
    expectTypeOf<Result1>().toEqualTypeOf<true>()

    type Result2 = PathMatches<'/quz/:id', '/quz/1/2/3'>
    expectTypeOf<Result2>().toEqualTypeOf<false>()

    type Result3 = PathMatches<'/quz/*splat', '/quz/123'>
    expectTypeOf<Result3>().toEqualTypeOf<true>()
  })
})

describe('CalculateScore', () => {
  it('calculates score for exact paths', () => {
    type Result1 = CalculateScore<'/'>
    expectTypeOf<Result1>().toEqualTypeOf<0>()

    type Result2 = CalculateScore<'/foo'>
    expectTypeOf<Result2>().toEqualTypeOf<100>()

    type Result3 = CalculateScore<'/foo/bar'>
    expectTypeOf<Result3>().toEqualTypeOf<200>()
  })

  it('calculates score for dynamic parameters', () => {
    type Result = CalculateScore<'/bar/:id'>
    expectTypeOf<Result>().toEqualTypeOf<110>() // 100 + 10
  })

  it('calculates score for optional parameters', () => {
    type Result = CalculateScore<'/baz/:id?'>
    expectTypeOf<Result>().toEqualTypeOf<105>() // 100 + 5
  })

  it('calculates score for optional groups', () => {
    type Result = CalculateScore<'/api{/:version}/users'>
    expectTypeOf<Result>().toEqualTypeOf<205>() // 100 + 5 + 100
  })

  it('calculates score for wildcards', () => {
    type Result = CalculateScore<'/quz/*splat'>
    expectTypeOf<Result>().toEqualTypeOf<101>() // 100 + 1
  })

  it('calculates score for complex paths', () => {
    type Result = CalculateScore<'/api/:version/users/:id'>
    expectTypeOf<Result>().toEqualTypeOf<220>() // 100 + 10 + 100 + 10
  })
})

describe('FilterMatchingPaths', () => {
  it('filters matching paths from union type', () => {
    type Paths = '/' | '/foo' | '/bar/:id' | '/quz/*splat' | '/quz/:id'

    type Result1 = FilterMatchingPaths<'/', Paths>
    expectTypeOf<Result1>().toEqualTypeOf<'/'>()

    type Result2 = FilterMatchingPaths<'/foo', Paths>
    expectTypeOf<Result2>().toEqualTypeOf<'/foo'>()

    type Result3 = FilterMatchingPaths<'/bar/123', Paths>
    expectTypeOf<Result3>().toEqualTypeOf<'/bar/:id'>()

    type Result4 = FilterMatchingPaths<'/quz/123', Paths>
    expectTypeOf<Result4>().toEqualTypeOf<'/quz/:id' | '/quz/*splat'>()

    type Result5 = FilterMatchingPaths<'/quz/1/2/3', Paths>
    expectTypeOf<Result5>().toEqualTypeOf<'/quz/*splat'>()

    type Result6 = FilterMatchingPaths<'/nonexistent', Paths>
    expectTypeOf<Result6>().toEqualTypeOf<never>()
  })
})

describe('SelectBestMatch', () => {
  it('selects best match from single option', () => {
    type Result = SelectBestMatch<[{ str: '/foo', score: 100 }]>
    expectTypeOf<Result>().toEqualTypeOf<'/foo'>()
  })

  it('selects best match based on score', () => {
    // Debug: Check scores first
    type Score1 = CalculateScore<'/quz/:id'>
    type Score2 = CalculateScore<'/quz/*splat'>
    // Score1 should be 110, Score2 should be 101

    expectTypeOf<Score1>().toEqualTypeOf<110>()
    expectTypeOf<Score2>().toEqualTypeOf<101>()

    type Result1 = SelectBestMatch<[
      { str: '/quz/:id', score: Score1 },
      { str: '/quz/*splat', score: Score2 },
    ]>
    // Debug: Check what Result1 actually is
    expectTypeOf<Result1>().toEqualTypeOf<'/quz/:id'>() // 110 > 101

    // Debug: Check scores
    type Score3 = CalculateScore<'/'>
    type Score4 = CalculateScore<'/foo'>
    // Score3 should be 0, Score4 should be 100

    expectTypeOf<Score3>().toEqualTypeOf<0>()
    expectTypeOf<Score4>().toEqualTypeOf<100>()

    type Result2 = SelectBestMatch<[
      { str: '/', score: Score3 },
      { str: '/foo', score: Score4 },
    ]>
    expectTypeOf<Result2>().toEqualTypeOf<'/foo'>() // 100 > 0
  })

  it('handles multiple matches with different scores', () => {
    // Debug: Check scores
    type Score1 = CalculateScore<'/bar/:id'>
    type Score2 = CalculateScore<'/baz/:id?'>
    type Score3 = CalculateScore<'/quz/*splat'>
    // Score1 should be 110, Score2 should be 105, Score3 should be 101

    expectTypeOf<Score1>().toEqualTypeOf<110>()
    expectTypeOf<Score2>().toEqualTypeOf<105>()
    expectTypeOf<Score3>().toEqualTypeOf<101>()

    type Result = SelectBestMatch<[
      { str: '/bar/:id', score: Score1 },
      { str: '/baz/:id?', score: Score2 },
      { str: '/quz/*splat', score: Score3 },
    ]>
    expectTypeOf<Result>().toEqualTypeOf<'/bar/:id'>() // 110 > 105 > 101
  })

  it('debug: check actual types', () => {
    // Check SplitPath results
    type Split1 = SplitPath<'/api{/:version}/users'>
    expectTypeOf<Split1>().toEqualTypeOf<['api', '{/:version}', 'users']>()

    // Check CalculateScore results - verify actual scores
    type ScoreQuzId = CalculateScore<'/quz/:id'>
    type ScoreQuzSplat = CalculateScore<'/quz/*splat'>
    type ScoreBarId = CalculateScore<'/bar/:id'>
    type ScoreBazId = CalculateScore<'/baz/:id?'>
    type ScoreRoot = CalculateScore<'/'>
    type ScoreFoo = CalculateScore<'/foo'>

    // These will show actual values if they don't match
    expectTypeOf<ScoreQuzId>().toEqualTypeOf<110>()
    expectTypeOf<ScoreQuzSplat>().toEqualTypeOf<101>()
    expectTypeOf<ScoreBarId>().toEqualTypeOf<110>()
    expectTypeOf<ScoreBazId>().toEqualTypeOf<105>()
    expectTypeOf<ScoreRoot>().toEqualTypeOf<0>()
    expectTypeOf<ScoreFoo>().toEqualTypeOf<100>()

    // Check FilterMatchingPaths results
    type Filter1 = FilterMatchingPaths<'/quz/123', '/quz/:id' | '/quz/*splat'>
    expectTypeOf<Filter1>().toEqualTypeOf<'/quz/:id' | '/quz/*splat'>()

    // Check SelectBestMatch results - this will show what it actually returns
    type Select1 = SelectBestMatch<[
      { str: '/quz/:id', score: ScoreQuzId },
      { str: '/quz/*splat', score: ScoreQuzSplat },
    ]>
    // Expected: '/quz/:id' (score 110)
    // If this fails, it will show the actual result (likely '/quz/*splat')
    expectTypeOf<Select1>().toEqualTypeOf<'/quz/:id'>()

    // Also test the reverse order to see if order matters
    type Select2 = SelectBestMatch<[
      { str: '/quz/*splat', score: ScoreQuzSplat },
      { str: '/quz/:id', score: ScoreQuzId },
    ]>
    expectTypeOf<Select2>().toEqualTypeOf<'/quz/:id'>()
  })
})

describe('MostMatchPath', () => {
  it('get most match path', () => {
    type Paths = '/' | '/foo' | '/bar/:id' | '/baz/:id?' | '/quz/*splat' | '/quz/:id' | '/api{/:version}/users'
    type Result1 = MostMatchPath<'/', Paths>

    expectTypeOf<Result1>().toEqualTypeOf<'/'>()

    type Result2 = MostMatchPath<'/foo', Paths>

    expectTypeOf<Result2>().toEqualTypeOf<'/foo'>()

    type Result3 = MostMatchPath<'/bar/123', Paths>

    expectTypeOf<Result3>().toEqualTypeOf<'/bar/:id'>()

    type Result4 = MostMatchPath<'/baz', Paths>

    expectTypeOf<Result4>().toEqualTypeOf<'/baz/:id?'>()

    type Result5 = MostMatchPath<'/baz/optional', Paths>

    expectTypeOf<Result5>().toEqualTypeOf<'/baz/:id?'>()

    type Result6 = MostMatchPath<'/quz/1/2/3', Paths>

    expectTypeOf<Result6>().toEqualTypeOf<'/quz/*splat'>()

    type Result7 = MostMatchPath<'/quz/123', Paths>

    expectTypeOf<Result7>().toEqualTypeOf<'/quz/:id'>()

    type Result8 = MostMatchPath<'/api/users', Paths>

    expectTypeOf<Result8>().toEqualTypeOf<'/api{/:version}/users'>()

    type Result9 = MostMatchPath<'/api/v1/users', Paths>

    expectTypeOf<Result9>().toEqualTypeOf<'/api{/:version}/users'>()
  })
})
