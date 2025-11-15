export type PageProps<P = unknown> = P & {
  path: string
  children?: React.ReactNode
}
export type LayoutComponent = React.ComponentType<React.PropsWithChildren>
export type PageComponent = React.ComponentType<PageProps>
export type RootComponent = React.ComponentType<React.PropsWithChildren>
