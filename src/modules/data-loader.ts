import type { UserModule } from '~~/lib/types/app'
import { DataLoaderPlugin } from 'unplugin-vue-router/data-loaders'

export const install: UserModule = ({ app, router }) => {
  app.use(DataLoaderPlugin, { router })
}
