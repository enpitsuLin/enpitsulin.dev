import type { Ref } from 'vue'
import { isRef, toRef } from 'vue'

function toArray(value: string | string[] | ((key: string) => boolean)) {
  if (typeof value === 'function') {
    return value.toString().split(',').map(key => key.trim())
  }
  return Array.isArray(value) ? value : [value]
}

const useStateKeyPrefix = '$s'

export function useState<T>(key?: string, init?: (() => T | Ref<T>)): Ref<T>
export function useState<T>(init?: (() => T | Ref<T>)): Ref<T>
export function useState<T>(...args: any): Ref<T> {
  const autoKey = typeof args[args.length - 1] === 'string' ? args.pop() : undefined
  if (typeof args[0] !== 'string') {
    args.unshift(autoKey)
  }
  const [_key, init] = args as [string, (() => T | Ref<T>)]
  if (!_key || typeof _key !== 'string') {
    throw new TypeError(`[useState] key must be a string: ${_key}`)
  }
  if (init !== undefined && typeof init !== 'function') {
    throw new Error(`[useState] init must be a function: ${init}`)
  }
  const key = useStateKeyPrefix + _key

  const app = useApp()
  const state = toRef(app.payload.state, key)
  if (state.value === undefined && init) {
    const initialValue = init()

    if (isRef(initialValue)) {
      // vue will unwrap the ref for us
      app.payload.state[key] = initialValue
      return initialValue as Ref<T>
    }
    state.value = initialValue
  }
  return state
}

export function clearState(
  keys?: string | string[] | ((key: string) => boolean),
): void {
  const app = useApp()
  const _allKeys = Object.keys(app.payload.state)
    .map(key => key.substring(useStateKeyPrefix.length))

  const _keys: string[] = !keys
    ? _allKeys
    : typeof keys === 'function'
      ? _allKeys.filter(keys)
      : toArray(keys)

  for (const _key of _keys) {
    const key = useStateKeyPrefix + _key
    if (key in app.payload.state) {
      app.payload.state[key] = undefined
    }
  }
}
