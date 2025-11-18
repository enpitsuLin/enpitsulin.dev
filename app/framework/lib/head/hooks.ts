'use client'

import type {
  ActiveHeadEntry,
  HeadEntryOptions,
  HeadSafe,
  Unhead,
  UseHeadInput,
  UseScriptInput,
  UseScriptOptions,
  UseScriptReturn,
  UseSeoMetaInput,
} from 'unhead/types'
import { use, useEffect, useMemo, useRef } from 'react'
import { useHead as baseHead, useHeadSafe as baseHeadSafe, useSeoMeta as baseSeoMeta, useScript as baseUseScript } from 'unhead'
import { UnheadContext } from './context'

export function useUnhead(): Unhead {
  // fallback to react context
  const instance = use<Unhead | null>(UnheadContext)
  if (!instance) {
    throw new Error('useHead() was called without provide context.')
  }
  return instance
}

function useWithSideEffects<Input, T extends ActiveHeadEntry<Input>>(input: Input, options: any, fn: any): T {
  const unhead = useUnhead()
  const entryRef = useRef<T | null>(null)

  // Create entry only once, even in Strict Mode
  // eslint-disable-next-line react-hooks/refs
  if (!entryRef.current) {
    entryRef.current = fn(unhead, input, options)
  }

  // Patch entry when input changes
  useEffect(() => {
    entryRef.current?.patch(input)
  }, [input])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      entryRef.current?.dispose()
      // Clear ref so new entry is created on remount
      entryRef.current = null
    }
  }, [])

  // eslint-disable-next-line react-hooks/refs
  return entryRef.current!
}

export function useHead(input: UseHeadInput = {}, options: HeadEntryOptions = {}): ActiveHeadEntry<UseHeadInput> {
  return useWithSideEffects(input, options, baseHead)
}

export function useHeadSafe(input: HeadSafe = {}, options: HeadEntryOptions = {}): ActiveHeadEntry<HeadSafe> {
  return useWithSideEffects(input, options, baseHeadSafe)
}

export function useSeoMeta(input: UseSeoMetaInput = {}, options: HeadEntryOptions = {}): ActiveHeadEntry<UseSeoMetaInput> {
  return useWithSideEffects(input, options, baseSeoMeta)
}

export function useScript<T extends Record<symbol | string, any> = Record<symbol | string, any>>(input: UseScriptInput, options: UseScriptOptions<T> = {}): UseScriptReturn<T> {
  const head = useUnhead()

  const mountCbs = useRef<Array<() => void>>([])

  const isMounted = useRef(false)

  // Note: we don't remove scripts on unmount as it's not a common use case and reloading the script may be expensive
  const sideEffects = useRef<(() => void)[]>([])

  const script = useMemo(() => {
    const trigger: UseScriptOptions['trigger'] = (load) => {
      if (isMounted.current) {
        load()
      }
      else {
        mountCbs.current.push(load)
      }
    }
    const _script = baseUseScript(head, input, { trigger, ...options })

    // if we have a scope we should make these callbacks reactive
    // eslint-disable-next-line react-hooks/immutability
    _script.onLoaded = (cb: (instance: T) => void | Promise<void>) => _registerCb('loaded', cb)
    // eslint-disable-next-line react-hooks/immutability
    _script.onError = (cb: (err?: Error) => void | Promise<void>) => _registerCb('error', cb)
    return _script
  }, [head, input, options])

  useEffect(() => {
    isMounted.current = true
    mountCbs.current.forEach(i => i())
    return () => {
      isMounted.current = false
      script._triggerAbortController?.abort()
      sideEffects.current.forEach(i => i())
    }
  }, [])

  function _registerCb(key: 'loaded' | 'error', cb: any) {
    let i: number | null
    const destroy = () => {
      // avoid removing the wrong callback
      if (i) {
        script._cbs[key]?.splice(i - 1, 1)
        i = null
      }
    }
    mountCbs.current.push(() => {
      if (!script._cbs[key]) {
        cb(script.instance)
        return () => { }
      }
      i = script._cbs[key].push(cb)
      sideEffects.current.push(destroy)
      return destroy
    })
  }

  return script
}
