import type { VueHeadClient } from '@unhead/vue/types'
import type { Context } from 'hono'
import type { Hookable, HookCallback } from 'hookable'
import type { App, onErrorCaptured, VNode } from 'vue'
import type { SSRContext } from 'vue/server-renderer'
import type { Env } from '~~/server/middleware/context'
import { createHooks } from 'hookable'
import { getContext } from 'unctx'
import { getCurrentInstance, reactive, shallowReactive } from 'vue'

const zootAppCtx = /* #__PURE__ */ getContext<ZootApp>('zoot-app')

type HookResult = Promise<void> | void

interface AppRenderedContext { ssrContext: ZootApp['ssrContext'] }

export interface RuntimeZootHoooks {
  'app:created': (app: App<Element>) => HookResult
  'app:beforeMount': (app: App<Element>) => HookResult
  'app:mounted': (app: App<Element>) => HookResult
  'app:rendered': (ctx: AppRenderedContext) => HookResult
  'app:redirected': () => HookResult
  'app:suspense:resolve': (Component?: VNode) => HookResult
  'app:error': (err: any) => HookResult
  'app:error:cleared': (options: { redirect?: string }) => HookResult
  'app:chunkError': (options: { error: any }) => HookResult
  'app:data:refresh': (keys?: string[]) => HookResult
  'link:prefetch': (link: string) => HookResult
  'page:start': (Component?: VNode) => HookResult
  'page:finish': (Component?: VNode) => HookResult
  'page:transition:finish': (Component?: VNode) => HookResult
  'vue:setup': () => void
  'vue:error': (...args: Parameters<Parameters<typeof onErrorCaptured>[0]>) => HookResult
}

export interface ZootSSRContext extends SSRContext {
  url: string
  context: Context<Env>
  modules: Set<string>
  /** whether we are rendering an SSR error */
  error?: boolean
  zoot: _ZootApp
  head: VueHeadClient
  payload: _ZootApp['payload']
  teleports?: Record<string, string>
  runtimeConfig: RuntimeConfig
  /** redirect URL if route changed during SSR rendering */
  redirect?: string
  _payloadReducers: Record<string, (value: any) => any>
}

export interface RuntimeConfig {
  app: {
    baseURL: string
  }
  public: {
    [key: string]: any
  }
}

export interface ZootPayload {
  serverRendered?: boolean
  data: Record<string, any>
  state: Record<string, any>
  config?: Pick<RuntimeConfig, 'public' | 'app'>
  error?: Error | undefined
  [key: string]: unknown
}

interface _ZootApp {
  vueApp: App<Element>

  hooks: Hookable<RuntimeZootHoooks>
  hook: _ZootApp['hooks']['hook']
  callHook: _ZootApp['hooks']['callHook']

  [key: string]: unknown

  $config: RuntimeConfig

  isHydrating?: boolean

  /** @internal */
  _payloadRevivers: Record<string, (data: any) => any>

  ssrContext?: ZootSSRContext
  payload: ZootPayload

  provide: (name: string, value: any) => void
}

export interface ZootApp extends _ZootApp {}

export const ZootPluginIndicator = Symbol('__zoot_plugin')
export interface Plugin<Injections extends Record<string, unknown> = Record<string, unknown>> {
  (zoot: _ZootApp): Promise<void> | Promise<{ provide?: Injections }> | void | { provide?: Injections }
  [ZootPluginIndicator]?: true
}

export interface CreateOptions {
  vueApp: ZootApp['vueApp']
  ssrContext?: ZootApp['ssrContext']
}

export function createZootApp(options: CreateOptions) {
  const zootApp = {
    provide: undefined as unknown as ZootApp['provide'],
    isHydrating: !import.meta.env.SSR,
    payload: reactive({
      ...options.ssrContext?.payload || {},
      error: shallowReactive({}),
    }),
    _payloadRevivers: {},
    ...options,
  } as ZootApp

  if (import.meta.env.SSR) {
    zootApp.payload.serverRendered = true
  }

  if (!import.meta.env.SSR) {
    const __ZOOT__ = window.__ZOOT__
    // TODO: remove/refactor in https://github.com/nuxt/nuxt/issues/25336
    if (__ZOOT__) {
      for (const key in __ZOOT__) {
        switch (key) {
          case 'data':
          case 'state':
            // Preserve reactivity for non-rich payload support
            Object.assign(zootApp.payload[key], __ZOOT__[key])
            break

          default:
            zootApp.payload[key] = __ZOOT__[key]
        }
      }
    }
  }

  zootApp.hooks = createHooks<RuntimeZootHoooks>()
  zootApp.hook = zootApp.hooks.hook

  if (import.meta.env.SSR) {
    async function contextCaller(hooks: HookCallback[], args: any[]) {
      for (const hook of hooks) {
        await zootAppCtx.call(zootApp, () => hook(...args))
      }
    }
    // Patch callHook to preserve ZootApp context on server
    // TODO: Refactor after https://github.com/unjs/hookable/issues/74
    zootApp.hooks.callHook = (name: any, ...args: any[]) => zootApp.hooks.callHookWith(contextCaller, name, ...args)
  }

  zootApp.callHook = zootApp.hooks.callHook

  zootApp.provide = (name: string, value: any) => {
    const $name = `$${name}`
    defineGetter(zootApp, $name, value)
    defineGetter(zootApp.vueApp.config.globalProperties, $name, value)
  }

  defineGetter(zootApp.vueApp, '$zoot', zootApp)
  defineGetter(zootApp.vueApp.config.globalProperties, '$zoot', zootApp)

  if (import.meta.env.SSR) {
    // Expose zoot to the renderContext
    if (zootApp.ssrContext) {
      zootApp.ssrContext.zoot = zootApp
    }
    // Expose to server renderer to create window.__ZOOT__
    zootApp.ssrContext = zootApp.ssrContext || {} as any

    if (zootApp.ssrContext!.payload) {
      Object.assign(zootApp.payload, zootApp.ssrContext!.payload)
    }
    zootApp.ssrContext!.payload = zootApp.payload

    // Expose client runtime-config to the payload
    zootApp.payload.config = {
      public: options.ssrContext!.runtimeConfig.public,
      app: options.ssrContext!.runtimeConfig.app,
    }
  }

  if (!import.meta.env.SSR) {
    window.addEventListener('zoot.preloadError', (event) => {
      zootApp.callHook('app:chunkError', { error: (event as Event & { payload: Error }).payload })
    })

    // Log errors captured when running plugins, in the `app:created` and `app:beforeMount` hooks
    // as well as when mounting the app.
    const unreg = zootApp.hook('app:error', (...args) => {
      console.error('[zoot] error caught during app initialization', ...args)
    })
    zootApp.hook('app:mounted', unreg)
  }

  const runtimeConfig = import.meta.env.SSR
    ? options.ssrContext!.runtimeConfig
    : reactive(zootApp.payload.config!)

  zootApp.provide('config', runtimeConfig)

  return zootApp
}

export function defineZootPlugin<T extends Record<string, unknown>>(plugin: Plugin<T>) {
  plugin[ZootPluginIndicator] = true
  return plugin
}

export function isZootPlugin(plugin: unknown) {
  return typeof plugin === 'function'
    && ZootPluginIndicator in plugin
}

export async function applyPlugin(zootApp: ZootApp, plugin: Plugin) {
  if (typeof plugin !== 'function') {
    return
  }
  const { provide } = await callWithZoot(zootApp, plugin, [zootApp]) || {}
  if (provide && typeof provide === 'object') {
    for (const key in provide) {
      zootApp.provide(key, provide[key])
    }
  }
}

export async function applyPlugins(zootApp: ZootApp, plugins: Plugin[]) {
  for (const plugin of plugins) {
    await applyPlugin(zootApp, plugin)
  }
}

export function callWithZoot<T extends (...args: any[]) => any>(zoot: ZootApp | _ZootApp, setup: T, args?: Parameters<T>) {
  const fn: () => ReturnType<T> = () => args ? setup(...args as Parameters<T>) : setup()
  if (import.meta.env.SSR) {
    return zootAppCtx.callAsync(zoot as ZootApp, fn)
  }
  else {
    // In client side we could assume zoot app is singleton
    zootAppCtx.set(zoot as ZootApp)
    return fn()
  }
}

export function useZootApp() {
  const zootAppInstance = zootAppCtx.tryUse()

  if (!zootAppInstance) {
    const vm = getCurrentInstance()
    if (!vm) {
      throw new Error('zoot instance unavailable')
    }
    return vm.appContext.app.$zoot as ZootApp
  }

  return zootAppInstance
}

export function useRuntimeConfig(): RuntimeConfig {
  return useZootApp().$config
}

function defineGetter<K extends string | number | symbol, V>(obj: Record<K, V>, key: K, val: V) {
  Object.defineProperty(obj, key, { get: () => val })
}

declare global {
  interface Window {
    __ZOOT__?: Record<string, any>
  }
}

declare module 'vue' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface App<HostElement = any> {
    $zoot: ZootApp
  }
  interface ComponentCustomProperties {
    $zoot: ZootApp
  }
}
