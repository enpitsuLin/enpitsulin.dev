/* eslint-disable ts/no-namespace */
'use client'

import type { ComponentProps, ReactElement, ReactNode } from 'react'
import type {
  ActiveHeadEntry,
  ResolvableBodyAttributes,
  ResolvableHtmlAttributes,
  ResolvableValue,
  ResolvableHead as UseHeadInput,
} from 'unhead/types'
import { Children, isValidElement, useCallback, useEffect, useMemo, useRef } from 'react'
import { useUnhead } from './hooks'

interface HeadProps {
  children: ReactNode
  titleTemplate?: string
}

const ValidHeadTags = new Set([
  'title',
  'base',
  'htmlAttrs',
  'bodyAttrs',
  'meta',
  'link',
  'style',
  'script',
  'noscript',
  'titleTemplate',
])

interface UnheadElements {
  title: ComponentProps<'title'>
  base: ComponentProps<'base'>
  htmlAttrs: ResolvableHtmlAttributes
  bodyAttrs: ResolvableBodyAttributes
  meta: ComponentProps<'meta'>
  link: ComponentProps<'link'>
  style: ComponentProps<'style'>
  script: ComponentProps<'script'>
  noscript: ComponentProps<'noscript'>
  titleTemplate: {
    children?: string | ((title?: string) => string | null) | null
  }
}

function isValidHeadElement(o: any): o is ReactElement<
  UnheadElements[keyof UnheadElements],
  keyof UnheadElements
> {
  if (!isValidElement(o)) {
    return false
  }

  if (typeof o.type !== 'string') {
    return false
  }

  if (!ValidHeadTags.has(o.type)) {
    return false
  }

  return true
}

function normalizeResolvableValue<T, Default extends null | T = null>(value: ResolvableValue<T>, defaultValue?: Default): Default extends null ? T | null : T {
  let resloveValue: false | null | undefined | T
  if (typeof value === 'function') {
    const fn = value as (() => false | null | undefined | T)
    resloveValue = fn()
  }
  if (!value && !!defaultValue)
    return defaultValue

  return resloveValue as T
}

export function Head({ children, titleTemplate }: HeadProps) {
  const head = useUnhead()

  // Process children only when they change
  const processedElements = useMemo(() => {
    return Children.toArray(children).filter(isValidHeadElement)
  }, [children])

  const getHeadChanges = useCallback(() => {
    const input: UseHeadInput = {
      titleTemplate,
    }

    for (const element of processedElements) {
      const tagName = element.type
      switch (tagName) {
        case 'noscript': {
          const data = element.props as UnheadElements['noscript']

          const children = data.children as string | string[]
          const content = Array.isArray(children) ? children.map(String).join('') : String(children)
          const origin = normalizeResolvableValue(input.noscript) ?? []
          input.noscript = origin.concat({
            class: data.className,
            id: data.id,
            textContent: content,
          })
          break
        }
        case 'script': {
          const data = element.props as UnheadElements['script']

          const children = data.children as string | string[] | undefined
          const content = typeof children === 'undefined' ? undefined : Array.isArray(children) ? children.map(String).join('') : String(children)
          const origin = normalizeResolvableValue(input.script) ?? []
          input.script = origin.concat({
            id: data.id,
            innerHTML: content,
            src: data.src,
            crossorigin: data.crossOrigin,
          })
          break
        }
        case 'style': {
          const data = element.props as UnheadElements['style']

          const children = data.children as string | string[]
          const content = Array.isArray(children) ? children.map(String).join('') : String(children)
          const origin = normalizeResolvableValue(input.style) ?? []
          input.style = origin.concat({
            id: data.id,
            textContent: content,
          })
          break
        }
        case 'title': {
          const data = element.props as UnheadElements['title']
          const children = data.children as string | string[]
          const content = Array.isArray(children) ? children.map(String).join('') : String(children)
          input.title = {
            textContent: content,
          }
          break
        }
        case 'htmlAttrs': {
          input.htmlAttrs = element.props as UnheadElements['htmlAttrs']
          break
        }
        case 'bodyAttrs': {
          input.bodyAttrs = element.props as UnheadElements['bodyAttrs']
          break
        }
        case 'meta': {
          const data = element.props as UnheadElements['meta']
          const origin = normalizeResolvableValue(input.meta) ?? []
          input.meta = origin.concat({
            'id': data.id,
            'charset': data.charSet,
            'content': data.content,
            'http-equiv': data.httpEquiv,
            'media': data.media,
            'name': data.name,
          })
          break
        }
        case 'link': {
          const data = element.props as UnheadElements['link']
          const origin = normalizeResolvableValue(input.link) ?? []
          input.link = origin.concat({
            as: data.as as any,
            rel: data.rel,
            blocking: data.blocking,
            crossorigin: data.crossOrigin,
            fetchpriority: data.fetchPriority,
            href: data.href,
            hreflang: data.hrefLang,
            integrity: data.integrity,
            media: data.media,
            imagesrcset: data.imageSrcSet,
            imagesizes: data.imageSizes,
            referrerpolicy: data.referrerPolicy,
            sizes: data.sizes,
            type: data.type,
          })
          break
        }
        case 'base':{
          const data = element.props as UnheadElements['base']
          const origin = normalizeResolvableValue(input.base) ?? []
          input.base = {
            ...origin,
            href: data.href,
            target: data.target,
          }
          break
        }
        case 'titleTemplate':{
          const data = element.props as UnheadElements['titleTemplate']
          if (data.children) {
            input.titleTemplate = {
              textContent: data.children,
            }
          }
          break
        }
      }
    }

    return input
  }, [processedElements, titleTemplate])

  const headRef = useRef<ActiveHeadEntry<any> | null>(
    head.push(getHeadChanges()),
  )

  useEffect(() => {
    return () => {
      if (headRef.current?.dispose) {
        headRef.current.dispose()
      }
      headRef.current = null
    }
  }, [])

  useEffect(() => {
    headRef.current?.patch(getHeadChanges())
  }, [getHeadChanges])

  return null as ReactNode
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends Pick<UnheadElements, 'titleTemplate' | 'bodyAttrs' | 'htmlAttrs'> {
    }
  }
}
