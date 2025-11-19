import { describe, expect, it } from 'vitest'
import { parseSegment } from './segment'

describe('parseSegment', () => {
  describe('parseSegment for static segment', () => {
    it('work properly for base usage', () => {
      const [segment, pathParams, subsegment] = parseSegment('foo')

      expect(segment).toEqual('foo')
      expect(pathParams).length(0)
      expect(subsegment).toStrictEqual(['foo'])
    })
  })

  describe('parseSegment for param segment', () => {
    it('work properly for base usage', () => {
      const [segment, pathParams, subsegment] = parseSegment('[foo]')

      expect(segment).toEqual(':foo')
      expect(pathParams).length(1)
      expect(subsegment).length(1)

      expect(subsegment).toStrictEqual(pathParams)
      expect(pathParams).toStrictEqual([
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'foo',
          parser: null,
          repeatable: false,
        },
      ])
    })

    it('work properly for complex usage', () => {
      const [segment, pathParams, subsegment] = parseSegment('foo-[bar]')

      expect(segment).toEqual('foo-:bar')
      expect(pathParams).length(1)
      expect(subsegment).length(2)

      expect(pathParams).toStrictEqual([
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'bar',
          parser: null,
          repeatable: false,
        },
      ])
      expect(subsegment).toStrictEqual([
        'foo-',
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'bar',
          parser: null,
          repeatable: false,
        },
      ])
    })

    it('work properly for optional param', () => {
      const [segment, pathParams, subsegment] = parseSegment('[[foo]]')

      expect(segment).toEqual(':foo?')
      expect(pathParams).length(1)
      expect(subsegment).length(1)

      expect(subsegment).toStrictEqual(pathParams)
      expect(pathParams).toStrictEqual([
        {
          isSplat: false,
          modifier: '?',
          optional: true,
          paramName: 'foo',
          parser: null,
          repeatable: false,
        },
      ])
    })

    it('work properly for repeatable param', () => {
      const [segment, pathParams, subsegment] = parseSegment('[foo]+')

      expect(segment).toEqual(':foo+')
      expect(pathParams).length(1)
      expect(subsegment).length(1)

      expect(subsegment).toStrictEqual(pathParams)
      expect(pathParams).toStrictEqual([
        {
          isSplat: false,
          modifier: '+',
          optional: false,
          paramName: 'foo',
          parser: null,
          repeatable: true,
        },
      ])
    })

    it('work properly for optional repeatable param', () => {
      const [segment, pathParams, subsegment] = parseSegment('[[foo]]+')

      expect(segment).toEqual(':foo*')
      expect(pathParams).length(1)
      expect(subsegment).length(1)

      expect(subsegment).toStrictEqual(pathParams)
      expect(pathParams).toStrictEqual([
        {
          isSplat: false,
          modifier: '*',
          optional: true,
          paramName: 'foo',
          parser: null,
          repeatable: true,
        },
      ])
    })

    it('work properly for splat param', () => {
      const [segment, pathParams, subsegment] = parseSegment('[...foo]')

      expect(segment).toEqual(':foo(.*)')
      expect(pathParams).length(1)
      expect(subsegment).length(1)

      expect(subsegment).toStrictEqual(pathParams)
      expect(pathParams).toStrictEqual([
        {
          isSplat: true,
          modifier: '',
          optional: false,
          paramName: 'foo',
          parser: null,
          repeatable: false,
        },
      ])
    })

    it('work properly for multi params', () => {
      const [segment, pathParams, subsegment] = parseSegment('product_[skuId]_[seoDescription]')

      expect(segment).toEqual('product_:skuId()_:seoDescription')
      expect(pathParams).length(2)
      expect(subsegment).length(4)

      expect(subsegment).toStrictEqual([
        'product_',
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'skuId',
          parser: null,
          repeatable: false,
        },
        '_',
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'seoDescription',
          parser: null,
          repeatable: false,
        },
      ])
      expect(pathParams).toStrictEqual([
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'skuId',
          parser: null,
          repeatable: false,
        },
        {
          isSplat: false,
          modifier: '',
          optional: false,
          paramName: 'seoDescription',
          parser: null,
          repeatable: false,
        },
      ])
    })
  })

  describe('parseSegment for group segment', () => {
    it('work properly for base usage', () => {
      const [segment, pathParams, subsegment] = parseSegment('(foo)')

      expect(segment).toEqual('(foo)')
      expect(pathParams).length(0)
      expect(subsegment).toStrictEqual(['(foo)'])
    })
  })
})
