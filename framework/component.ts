import type { InferPathParams } from './lib/router/infer-param-type'

export interface PageProps<Path extends string = string> {
  path: string
  params: InferPathParams<Path>
}

export type LayoutComponent = React.ComponentType<React.PropsWithChildren>
export type PageComponent = React.ComponentType<PageProps>
export type RootComponent = React.ComponentType<React.PropsWithChildren>
